+++
title = 'Unreal Taiga Integration'
weight = 0
summary = '''
Unreal Engine plugin to allow developers to browse and quickly report issues with world context metadata. Allows before and after to be compared from the exact same camera angle as when the original screenshot was taken.
'''
roles = ['All', 'Technical Artist', 'Game Programmer', 'Tools Programmer']
date = 2026-04-07
draft = false
+++

# Unreal Taiga Integration
[Taiga](https://taiga.io/) is an open-source project management tool that I find quite neat to use! However, many artists, level designers, and programmers I've collaborated with tend to use it less as deadlines approach.

I think part of the reason is friction, as it's a separate application (or browser tab) and designed more for general software development rather than game development. With this plugin I wanted to reduce that friction, and also take advantage of the fact that issues can be visualized in the game world itself!
{{< fakegif "summary.webm" >}}

## Browsing
Issues are a more ad-hoc variant of tasks and usually have a context or something specific that has broken or could be improved. In Taiga they are visualized in rows with sortable columns like this.
![alt text](image-2.png)

The plugin has an outliner which visualizes issues in a similar way to Taiga with columns for different issue proprties. It also shows issues inside the world itself, and when an issue is hovered in either of them a camera frustum shows where the camera was facing when the screenshot was taken.
{{< fakegif "browsing.webm" >}}

## Navigation
Issues can be teleported to by double clicking either in 3D or in the outliner. 
{{< fakegif "clicknav.webm" >}}

You can also teleport by looking in first person directly at an issue, and when the right mouse button is released, the camera selects and teleports to the issue. Issues are highlighted to make sure you don't teleport by suprise.
{{< fakegif "looknav.webm" >}}

Teleporting to an issue automatically enables a focus mode where the screenshot is overlaid on top of the screen. The screenshot then pingpongs between getting displayed and hidden, with a status indicated in the bottom right corner. This is intended to make it easier to compare the images with the current state of the editor.
{{< fakegif "compare.webm" >}}

## Filters
Taiga allows issues to be filtered, and custom filters can be saved.
![alt text](image-4.png)

The plugin also implements filters, unfortunatly these weren't exposed from the [Taiga REST API](https://docs.taiga.io/api.html) and thus can only be saved/edited locally.
{{< fakegif "filter.webm" >}}

## Reporting
Issues are reported by clicking **Create Issue**, which automatically takes a screenshot from the current editor camera perspective. These are automatically stored locally, and are uploaded to Taiga by clicking **Submit**. When the screenshot is taken, some additional metadata is appended on the PNG itself to make navigation work.
{{< fakegif "submit.webm" >}}

## REST API abstraction
The REST API abstraction is a glorified wrapper over Unreals internal JSON parser and HTTP API, but it integrates nicely with the [Tasks System](https://dev.epicgames.com/documentation/unreal-engine/tasks-systems-in-unreal-engine) to accomodate for the cases where there's a complex dependency chain between multiple tasks.

One example of that is when issues are refreshed. To be snappy the plugin fetches all outdated data and caches the result for subsequent refreshes, but the list issues request of the REST API won't return certain data like the description or attachments. Thus more runs with get issue and get issue attachment requests are required to fetch the complete issue data for all issues.
![alt text](image-8.png)
```cpp
void UKTSession::RefreshIssues()
{
	using namespace KT::TaigaAPI;

	FKTAuth Auth;
	if (!GetAuth(Auth))
	{
		KT::Notify(KT::ENotify::Fail,
			LOCTEXT("RefreshIssuesFailed", "Refresh issues failed"),
			LOCTEXT("UserIsNotLoggedIn", "UserIsNotLoggedIn"));
		return;
	}
	if (!Project)
	{
		UE_LOG(LogKalashTrack, Error, TEXT("taiga session: refreshing issues without project"))

		KT::Notify(KT::ENotify::Fail,
			LOCTEXT("RefreshIssuesFailed", "Refresh issues failed"),
			LOCTEXT("NoProjectSelected", "NoProjectSelected"));
		return;
	}

	using namespace UE::Tasks;

	const FString UserAuthToken = Auth.AuthToken;
	const int64 ProjectId = Project->Id;


	auto ListIssuesTask = MakeResponseTask<TArray<Issue::FDetail_List>>();
	ListIssuesTask->Launch(UE_SOURCE_LOCATION, [UserAuthToken, ProjectId]() {
		Issue::FListInfo ListInfo = {
			.AuthToken = UserAuthToken,
			.Project = ProjectId,
		};
		return Issue::List(ListInfo);
	});


	auto ListOutdatedIssuesTask = MakeResponseTask<TArray<Issue::FDetail_List>>();
	ListOutdatedIssuesTask->Launch(UE_SOURCE_LOCATION,
		[this, ListIssuesTask]() {

		TArray<Issue::FDetail_List> OutdatedIssues;
		if (!ListIssuesTask->GetResult()->HasValue())
		{
			return MakeResponseError<TArray<Issue::FDetail_List>>();
		}

		const TArray<Issue::FDetail_List>& ListIssues = ListIssuesTask->GetResult()->GetValue();

		OutdatedIssues.Reserve(Issues.Num());
		for (const Issue::FDetail_List& IssueDetail : ListIssues)
		{
			if (int32* Index = IssueIdToIndex.Find(IssueDetail.Id);
				Index == nullptr
				|| !Issues[*Index].Version
				|| *Issues[*Index].Version < IssueDetail.Version)
			{
				OutdatedIssues.Add(IssueDetail);
			}
		}

		return MakeResponseValue(OutdatedIssues);
	}, Prerequisites(*ListIssuesTask));


	auto FetchOutdatedIssuesTask = MakeResponseTask<TArray<TResponseRef<Issue::FDetail>>>();
	FetchOutdatedIssuesTask->Launch(UE_SOURCE_LOCATION,
		[UserAuthToken, ListOutdatedIssuesTask]() {

		if (!ListOutdatedIssuesTask->GetResult()->HasValue())
		{
			return MakeResponseError<TArray<TResponseRef<Issue::FDetail>>>();
		}

		const TArray<Issue::FDetail_List>& OutdatedIssueProxies = ListOutdatedIssuesTask->GetResult()->GetValue();

		TArray<TResponseRef<Issue::FDetail>> FullIssueFetches;
		FullIssueFetches.SetNum(OutdatedIssueProxies.Num());

		for (int32 N = 0; N < OutdatedIssueProxies.Num(); ++N)
		{
			const Issue::FDetail_List& OutdatedProxyIssue = OutdatedIssueProxies[N];

			Issue::FGetInfo GetInfo{
				.AuthToken = UserAuthToken,
				.Id = OutdatedProxyIssue.Id,
			};

			FullIssueFetches[N] = Issue::Get(GetInfo);
		}

		return MakeResponseValue(FullIssueFetches);
	}, Prerequisites(*ListOutdatedIssuesTask));


	FTask WriteProxyIssuesTask;
	WriteProxyIssuesTask.Launch(UE_SOURCE_LOCATION, [this, ListOutdatedIssuesTask]() {

		if (!ListOutdatedIssuesTask->GetResult()->HasValue())
		{
			return;
		}

		for (const Issue::FDetail_List& ProxyIssueDetail : ListOutdatedIssuesTask->GetResult()->GetValue())
		{
			int32 IssueIndex;
			FKTIssue& Issue = FindOrAddIssueById(ProxyIssueDetail.Id, IssueIndex);
			Issue.Id = ProxyIssueDetail.Id;
			Issue.Version = ProxyIssueDetail.Version;
			Issue.Subject = FText::FromString(ProxyIssueDetail.Subject);
			Issue.AssignedTo = ProxyIssueDetail.AssignedTo;
			Issue.Severity = ProxyIssueDetail.Severity;
			Issue.Priority = ProxyIssueDetail.Priority;
			Issue.Status = ProxyIssueDetail.Status;
			Issue.Type = ProxyIssueDetail.Type;
			OnIssueModified.Broadcast(IssueIndex, Issue);		
		}
	}, Prerequisites(*ListOutdatedIssuesTask), ETaskPriority::Normal, EExtendedTaskPriority::GameThreadNormalPri);


	FTask WriteFullIssuesTask;
	WriteFullIssuesTask.Launch(UE_SOURCE_LOCATION, [this, FetchOutdatedIssuesTask]() {
		
		if (!FetchOutdatedIssuesTask->GetResult()->HasValue())
		{
			return;
		}

		for (const TResponseRef<Issue::FDetail>& IssueDetailResponse : FetchOutdatedIssuesTask->GetResult()->GetValue())
		{
			if (!IssueDetailResponse->HasValue())
			{
				continue;
			}
			
			const Issue::FDetail& IssueDetail = IssueDetailResponse->GetValue();
			
			int32 IssueIndex;
			FKTIssue& Issue = FindOrAddIssueById(IssueDetail.Id, IssueIndex);
			Issue.Id = IssueDetail.Id;
			Issue.Version = IssueDetail.Version;
			Issue.Subject = FText::FromString(IssueDetail.Subject);
			Issue.Description = FText::FromString(IssueDetail.Description);
			Issue.AssignedTo = IssueDetail.AssignedTo;
			Issue.Owner = IssueDetail.Owner;
			Issue.Severity = IssueDetail.Severity;
			Issue.Priority = IssueDetail.Priority;
			Issue.Status = IssueDetail.Status;
			Issue.Type = IssueDetail.Type;
			OnIssueModified.Broadcast(IssueIndex, Issue);
		}
	}, Prerequisites(*FetchOutdatedIssuesTask), ETaskPriority::Normal, EExtendedTaskPriority::GameThreadNormalPri);


	auto ListOutdatedIssueAttachmentsTask = MakeResponseTask<TArray<TResponseRef<TArray<Issue::FAttachmentDetail>>>>();
	ListOutdatedIssueAttachmentsTask->Launch(UE_SOURCE_LOCATION,
		[UserAuthToken, ProjectId, ListOutdatedIssuesTask]() {

			if (!ListOutdatedIssuesTask->GetResult()->HasValue())
			{
				return MakeResponseError<TArray<TResponseRef<TArray<Issue::FAttachmentDetail>>>>();
			}

			const TArray<Issue::FDetail_List>& OutdatedIssueProxies = ListOutdatedIssuesTask->GetResult()->GetValue();

			TArray<TResponseRef<TArray<Issue::FAttachmentDetail>>> IssueAttachmentListFetches;
			IssueAttachmentListFetches.SetNum(OutdatedIssueProxies.Num());

			for (int32 N = 0; N < OutdatedIssueProxies.Num(); ++N)
			{
				Issue::FListAttachmentsInfo ListAttachmentsInfo{
					.AuthToken = UserAuthToken,
					.Project = ProjectId,
					.ObjectId = OutdatedIssueProxies[N].Id
				};
				
				IssueAttachmentListFetches[N] = Issue::ListAttachments(ListAttachmentsInfo);
			}

			return MakeResponseValue(IssueAttachmentListFetches);
		}, Prerequisites(*ListOutdatedIssuesTask));


	struct FMainAttachmentFetch
	{
		int64 IssueId;
		FName Sha1;
		TResponseRef<TArray<uint8>> Response;
	};

	auto FetchMainAttachmentsTask = MakeResponseTask<TArray<FMainAttachmentFetch>>();
	FetchMainAttachmentsTask->Launch(UE_SOURCE_LOCATION,
		[this, ListOutdatedIssueAttachmentsTask]() {

		TArray<FMainAttachmentFetch> MainAttachmentFetches;
		if (!ListOutdatedIssueAttachmentsTask->GetResult()->HasValue())
		{
			return MakeResponseError<TArray<FMainAttachmentFetch>>();
		}

		for (const TResponseRef<TArray<Issue::FAttachmentDetail>>& ListIssueAttachmentsResponse : ListOutdatedIssueAttachmentsTask->GetResult()->GetValue())
		{
			if (!ListIssueAttachmentsResponse->HasValue())
			{
				continue;
			}

			//find main attachment
			const TArray<Issue::FAttachmentDetail>& IssueAttachments = ListIssueAttachmentsResponse->GetValue();
			const Issue::FAttachmentDetail* MainAttachment = nullptr;
			for (const Issue::FAttachmentDetail& AttachmentDetail : IssueAttachments)
			{
				if (AttachmentDetail.Name == MagicAttachmentPNG)
				{
					MainAttachment = &AttachmentDetail;
					break;
				}
			}
			if (!MainAttachment && IssueAttachments.Num() > 0)
			{
				MainAttachment = &IssueAttachments[0];
			}

			if (!MainAttachment)
			{
				continue;
			}

			//fetch main attachment if sha1 changed
			if (int32* Index = IssueIdToIndex.Find(MainAttachment->ObjectId);
				Index && Issues[*Index].Attachment.Sha1 != MainAttachment->Sha1)
			{
				Misc::FGetResourceInfo GetResourceInfo{
					.Resource = MainAttachment->URL,
				};
				
				FMainAttachmentFetch& Fetch = MainAttachmentFetches.Emplace_GetRef();
				Fetch.IssueId = MainAttachment->ObjectId;
				Fetch.Sha1 = FName(MainAttachment->Sha1);
				Fetch.Response = Misc::GetResource(GetResourceInfo);
			}
		}

		return MakeResponseValue<TArray<FMainAttachmentFetch>>(MainAttachmentFetches);
	}, Prerequisites(WriteProxyIssuesTask, WriteFullIssuesTask, *ListOutdatedIssueAttachmentsTask));


	FTask WriteIssueAttachments;
	WriteIssueAttachments.Launch(UE_SOURCE_LOCATION,
		[this, FetchMainAttachmentsTask]() {

		if (!FetchMainAttachmentsTask->GetResult()->HasValue())
		{
			return;
		}

		for (const FMainAttachmentFetch& Fetch : FetchMainAttachmentsTask->GetResult()->GetValue())
		{
			if (!Fetch.Response->HasValue())
			{
				continue;
			}

			int32 IssueIndex{};
			const FKTIssue& Issue = FindOrAddIssueById(Fetch.IssueId, IssueIndex);

			KT::AttachmentCache::TryCache(Fetch.Sha1, Fetch.Response->GetValue());
			DecompressFromPNG(Fetch.Response->GetValue(), Fetch.Sha1, Issues[IssueIndex].Attachment);
			OnIssueModified.Broadcast(IssueIndex, Issue);
		}
	}, Prerequisites(*FetchMainAttachmentsTask), ETaskPriority::Normal, EExtendedTaskPriority::GameThreadNormalPri);
}
```


## Custom editor mode
As this editor mode is a bit unorthodox to how the custom editor toolkit framework in Unreal usually is used, most of the default setup  is overriden. Normally a toolkit creates a tool panel to the left with a toolbar and brush settings, but this toolkit instead creates additional tabs in-place of where the regular world outliner/details panel used to be. 

To do this `Super::RequestModeUITabs()` is explicilty left out as it creates a lot of default widgets.
![alt text](image-12.png)

To create the custom outliner/details tabs, they are invoked later similarly to how the built-in Animation Mode works. 
![alt text](image-9.png)

The toolkit also manages additional widgets that are drawn on top of the editor viewport, which is used for the 3D text, status bar, and settings prompts.
![alt text](image-10.png)


## Slate Stuff
Almost all properties in Taiga can customized to the teams liking, thus most of the widgets are custom and need to be built dynamically. 
![alt text](image-13.png)

One example is the filter property widgets, which needs to fetch the list of available statuses, priorities, severities, and types from the current project.
![alt text](image-14.png)

To draw these custom widgets while still benefitting from the built-in property editor layout, a custom `IDetailCustomization` is registered/unregistered during module startup/shutdown.
```cpp
TSharedRef<IDetailCustomization> FKTFilterDetailCustomization::MakeInstance()
{
	return MakeShared<FKTFilterDetailCustomization>();
}


void FKTFilterDetailCustomization::CustomizeDetails(IDetailLayoutBuilder& DetailBuilder)
{
	TUniquePtr<IFKFilterField> Types = MakeUnique<TFKFilterField<
		FKTIssueType,
		&UKTFilter::Types,
		&FKTProject::IdToIssueType,
		&FKTProject::IssueTypes,
		&FKTIssueType::Name>>();

	TUniquePtr<IFKFilterField> Severities = MakeUnique<TFKFilterField<
		FKTSeverity,
		&UKTFilter::Severities,
		&FKTProject::IdToSeverity,
		&FKTProject::Severities,
		&FKTSeverity::Name>>();

	TUniquePtr<IFKFilterField> Priorities = MakeUnique<TFKFilterField<
		FKTPriority,
		&UKTFilter::Priorities,
		&FKTProject::IdToPriority,
		&FKTProject::Priorities,
		&FKTPriority::Name>>();

	TUniquePtr<IFKFilterField> Statuses = MakeUnique<TFKFilterField<
		FKTIssueStatus,
		&UKTFilter::Statuses,
		&FKTProject::IdToIssueStatus,
		&FKTProject::IssueStatuses,
		&FKTIssueStatus::Name>>();

	TUniquePtr<IFKFilterField> AssignedTos = MakeUnique<TFKFilterField<
		FKTMember,
		&UKTFilter::AssignedTos,
		&FKTProject::IdToMember,
		&FKTProject::Members,
		&FKTMember::FullNameDisplay>>();

	TUniquePtr<IFKFilterField> Roles = MakeUnique<TFKFilterField<
		FKTRole,
		&UKTFilter::Roles,
		&FKTProject::IdToRole,
		&FKTProject::Roles,
		&FKTRole::Name>>();

	TUniquePtr<IFKFilterField> CreatedBys = MakeUnique<TFKFilterField<
		FKTMember,
		&UKTFilter::CreatedBys,
		&FKTProject::IdToMember,
		&FKTProject::Members,
		&FKTMember::FullNameDisplay>>();

	

	TArray<TWeakObjectPtr<UKTFilter>> CustomizedFilters = DetailBuilder.GetObjectsOfTypeBeingCustomized<UKTFilter>();

	if (TWeakObjectPtr<UKTFilter> Filter = CustomizedFilters.Num() == 1 ? CustomizedFilters[0] : nullptr;
		Filter.IsValid())
	{
		Types->SetFilter(Filter);
		Severities->SetFilter(Filter);
		Priorities->SetFilter(Filter);
		Statuses->SetFilter(Filter);
		AssignedTos->SetFilter(Filter);
		Roles->SetFilter(Filter);
		CreatedBys->SetFilter(Filter);
	}

	TSharedRef<IPropertyHandle> NameProperty = DetailBuilder.GetProperty(GET_MEMBER_NAME_CHECKED(UKTFilter, Name));

	IDetailCategoryBuilder& DetailCategoryBuilder = DetailBuilder.EditCategory("Filter");
	DetailCategoryBuilder.AddProperty(NameProperty);

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("Type", "Type"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("Type", "Type"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(Types))
	];

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("Severity", "Severity"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("Severity", "Severity"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(Severities))
	];

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("Priority", "Priority"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("Priority", "Priority"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(Priorities))
	];

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("Status", "Status"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("Status", "Status"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(Statuses))
	];

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("AssignedTo", "Assigned To"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("AssignedTo", "Assigned To"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(AssignedTos))
	];

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("Role", "Role"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("Role", "Role"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(Roles))
	];

	DetailCategoryBuilder.AddCustomRow(LOCTEXT("CreatedBy", "Created By"))
	.NameContent()
	[
		SNew(STextBlock)
		.Text(LOCTEXT("CreatedBy", "Created By"))
		.Font(DetailBuilder.GetDetailFont())
	]
	.ValueContent()
	[
		SNew(SKTIssueFilterFieldDropdown, MoveTemp(CreatedBys))
	];
}
```

To reduce code duplication most of the property operations are abstracted away by this field class. It handles modifying, display text, and whether the item itself should be checked or not.
```cpp
class IFKFilterField
{
public:
	virtual ~IFKFilterField() = default;
	virtual void SetFilter(TWeakObjectPtr<UKTFilter> Filter) = 0;
	virtual int32 NumEntries() const = 0;
	virtual	FText GetEntryText(int32 EntryIndex) const = 0;
	virtual EKTFilterOp GetFilterOp() const = 0;
	virtual void ToggleEntry(EKTFilterOp EntryOp, int32 EntryIndex) = 0;
	virtual bool ContainsEntry(EKTFilterOp EntryOp, int32 EntryIndex) const = 0;
};


template<class EntryType, 
	TPair<EKTFilterOp, TSet<int64>> UKTFilter::* FilterField,
	const TMap<int64, int32> FKTProject::* IdToEntry,
	const TArray<EntryType> FKTProject::* EntryArray,
	const FText EntryType::* EntryDisplayText
>
class TFKFilterField : public IFKFilterField
{
public:
	TFKFilterField()
		: Filter(nullptr)
	{
	}


	void SetFilter(TWeakObjectPtr<UKTFilter> InFilter) override
	{
		Filter = InFilter;
	}


	int32 NumEntries() const override
	{
		const TArray<EntryType>* Entries = GetEntriesArray();
		return Entries ? Entries->Num() : 0;
	}


	FText GetEntryText(int32 Index) const override
	{
		FText Text;
		if (const EntryType* Entry = GetEntry(Index))
		{
			Text = (*Entry).*EntryDisplayText;
		}
		return Text;
	}

	
	EKTFilterOp GetFilterOp() const
	{
		EKTFilterOp FilterOp = EKTFilterOp::Include;
		if (!GetField())
		{
			return FilterOp;
		}
		const auto& [FieldOp, FieldSet] = *GetField();
		FilterOp = FieldOp;
		return FilterOp;
	}


	void ToggleEntry(EKTFilterOp EntryOp, int32 EntryIndex) override
	{
		const EntryType* Entry = GetEntry(EntryIndex);
		TPair<EKTFilterOp, TSet<int64>>* Field = GetField();
		if (!Entry || !Field)
		{
			return;
		}

		auto& [FieldOp, FieldSet] = *GetField();
		if (FieldOp != EntryOp)
		{
			FieldOp = EntryOp;
			FieldSet.Reset();
		}

		bool bAlreadyInSet = false;
		FieldSet.Add(Entry->Id, &bAlreadyInSet);
		if (bAlreadyInSet)
		{
			FieldSet.Remove(Entry->Id);
		}
		UKTSubsystem::Get().Filters().Filter();
	}


	bool ContainsEntry(EKTFilterOp EntryOp, int32 EntryIndex) const override
	{
		bool bContains = false;

		const EntryType* Entry = GetEntry(EntryIndex);
		if (!Entry || !GetField())
		{
			return bContains;
		}

		const auto& [FieldOp, FieldSet] = *GetField();
		bContains = FieldOp == EntryOp && FieldSet.Contains(Entry->Id);
		return bContains;
	}
private:
	TWeakObjectPtr<UKTFilter> Filter;


	const TPair<EKTFilterOp, TSet<int64>>* GetField() const
	{
		return Filter.IsValid() ? &((*Filter).*FilterField) : nullptr;
	}


	TPair<EKTFilterOp, TSet<int64>>* GetField()
	{
		return Filter.IsValid() ? &((*Filter).*FilterField) : nullptr;
	}


	const EntryType* GetEntry(int32 Index) const
	{
		const EntryType* Entry = nullptr;

		if (const TArray<EntryType>* Entries = GetEntriesArray();
			Entries && Entries->IsValidIndex(Index))
		{
			Entry = &(*Entries)[Index];
		}

		return Entry;
	}


	const TArray<EntryType>* GetEntriesArray() const
	{
		const FKTProject* Project = UKTSubsystem::Get().Session().GetProject();
		return Project ? &(Project->*EntryArray) : nullptr;
	}
};
```

The dropdown itself becomes relatively simple with the filter field abstraction. For the filter fields I wanted 2 separate dropdowns side by side to allows the user to quickly toggle and experiment between **Include**/**Exclude** without opening multiple separate dropdowns.
```cpp
class SKTIssueFilterFieldDropdown : public SCompoundWidget
{
public:
	SLATE_BEGIN_ARGS(SKTIssueFilters)
		{
		}
	SLATE_END_ARGS()
	
	
	SKTIssueFilterFieldDropdown()
		: Field(nullptr)
	{
	}


	void Construct(const FArguments& InArgs, TUniquePtr<IFKFilterField> InField)
	{
		Field = MoveTemp(InField);

		ChildSlot
		[
			SNew(SComboButton)
			.MenuContent()
			[
				MakeDropdownWidget()
			]
			.ButtonContent()
			[
				SNew(STextBlock)
				.Text(this, &SKTIssueFilterFieldDropdown::GetDropdownText)
				.Font(IDetailLayoutBuilder::GetDetailFont())
			]
		];
	}
private:
	TUniquePtr<IFKFilterField> Field;

	TSharedRef<SWidget> MakeDropdownWidget()
	{
		FMenuBuilder IncludeMenuBuilder(false, nullptr);
		IncludeMenuBuilder.BeginSection("Include", LOCTEXT("Include", "Include"));
		for (int32 N = 0; N < Field->NumEntries(); ++N)
		{
			const FText EntryDisplayText = Field->GetEntryText(N);

			IncludeMenuBuilder.AddMenuEntry(
				EntryDisplayText,
				EntryDisplayText,
				FSlateIcon(),
				FUIAction(
					FExecuteAction::CreateRaw(Field.Get(), &IFKFilterField::ToggleEntry, EKTFilterOp::Include, N),
					FCanExecuteAction(),
					FIsActionChecked::CreateRaw(Field.Get(), &IFKFilterField::ContainsEntry, EKTFilterOp::Include, N)
				),
				NAME_None,
				EUserInterfaceActionType::ToggleButton
			);
		}
		IncludeMenuBuilder.EndSection();

		FMenuBuilder ExcludeMenuBuilder(false, nullptr);
		ExcludeMenuBuilder.BeginSection("Exclude", LOCTEXT("Exclude", "Exclude"));
		for (int32 N = 0; N < Field->NumEntries(); ++N)
		{
			const FText EntryDisplayText = Field->GetEntryText(N);

			ExcludeMenuBuilder.AddMenuEntry(
				EntryDisplayText,
				EntryDisplayText,
				FSlateIcon(),
				FUIAction(
					FExecuteAction::CreateRaw(Field.Get(), &IFKFilterField::ToggleEntry, EKTFilterOp::Exclude, N),
					FCanExecuteAction(),
					FIsActionChecked::CreateRaw(Field.Get(), &IFKFilterField::ContainsEntry, EKTFilterOp::Exclude, N)
				),
				NAME_None,
				EUserInterfaceActionType::ToggleButton
			);
		}
		ExcludeMenuBuilder.EndSection();

		return SNew(SHorizontalBox)

		+ SHorizontalBox::Slot()
		.FillWidth(1)
		[
			IncludeMenuBuilder.MakeWidget()
		]

		+ SHorizontalBox::Slot()
		.FillWidth(1)
		[
			ExcludeMenuBuilder.MakeWidget()
		];
	}
	

	FText GetDropdownText() const
	{
		FText Text;

		const EKTFilterOp FilterOp = Field->GetFilterOp();
		
		TStringBuilder<256> String;
		if (FilterOp == EKTFilterOp::Exclude)
		{
			String << TEXT("Exclude ");
		}

		int32 Count = 0;
		for (int32 N = 0; N < Field->NumEntries(); ++N)
		{
			if (Field->ContainsEntry(FilterOp, N))
			{
				if (Count > 0)
				{
					String << TEXT(", ");
				}
				String << Field->GetEntryText(N).ToString();
				++Count;
			}
		}

		Text = (Count > 0)
			? FText::FromString(String.ToString())
			: LOCTEXT("All", "All");
		return Text;
	}

}; //~SKTIssueFilterComboBox
```


## Digging source code
I used Visual Studio during development as the RAM consumption of [10x](https://10xeditor.com/) is too heavy to use for Unreal Engine projects on my personal PC, but I missed the speed and search functionality. 

I think a bandaid that worked suprisingly well was to make some shell scripts that wrapped [ripgrep](https://github.com/BurntSushi/ripgrep) to search for fixed strings specifically in the Unreal Engine Source/Plugin directories. When searching for engine strings it doesn't miss anything, and it's incomprehensibly much faster than searching through Visual Studio!

![alt text](image-7.png)

PureRef was also quite useful when trying to reverse-engineer bugs and how undocumented stuff works, usually when I reverse engineer something it's like building a tree/graph out of possible solutions and eleminating the branches one by one until something works nicely. During those times it's nice to be able to draw ad-hoc annotations, and by using text it can also become a spatial string clipboard.

![alt text](image-6.png)
