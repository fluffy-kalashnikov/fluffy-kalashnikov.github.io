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

## Setup
The plugin has a custom editor mode for browsing issues to easily be togglable. As a Taiga user account and project is required to fetch issues, the screen is automatically blocked with a prompt when credentials have to be entered.

![alt text](image.png)

## Browsing
Issues are a more ad-hoc variants of tasks and usually have a context or something specific that has broken or could be improved. In Taiga they are visualized in rows with sortable columns like this.

![alt text](image-2.png)

The plugin has an outliner which visualizes issues in a similar way to Taiga with columns for different issue proprties. It also shows issues inside the world itself! Issues can be teleported to by double clicking either in 3D or the outliner, and when an issue is hovered in either of them a camera frustum shows where the camera was facing when the screenshot was taken.

![alt text](image-1.png)

## Filters
Taiga allows issues to be filtered, and custom filters can be saved.
![alt text](image-4.png)

The plugin also implements filters, unfortunatly these weren't exposed from the [Taiga REST API](https://docs.taiga.io/api.html) and thus have to be stored locally.

![alt text](image-3.png)

## Reporting
Issues are reported by clicking **Create Issue**, which automatically takes a screenshot from the current editor camera perspective. These are automatically stored locally, and are uploaded to Taiga by clicking **Submit**. When the screenshot is taken, some additional metadata is appended on the PNG itself.

![alt text](image-5.png)

I initially tried storing metadata in the issue description itself, I also considered storing them in a separate TXT attachment. Some issues I saw with it was that it was easy to fiddle with, and as multiple operations are required to update, partial failures can make them permanently out of sync. 

Appending a binary header to the back of the PNG makes the update process more atomic, and could also allow multiple attachments to store an individual context in the future.


## REST API abstraction
The REST API abstraction is a glorified wrapper over Unreals internal JSON parser and HTTP API, but it integrates nicely with the [Tasks System](https://dev.epicgames.com/documentation/unreal-engine/tasks-systems-in-unreal-engine) to accomodate for those cases when there's a complex dependency chain between multiple tasks.

One example of that is when issues are refreshed. To be snappy the plugin fetches all outdated data and caches the result for subsequent refreshes, but for example the list issues request of the REST API won't return certain data like the description. Thus more runs with a regular get issue request are required to fetch the complete issue data for all issues.
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
As this editor mode is a bit unorthodox to how the custom editor toolkit framework in Unreal usually is used, most of the default setup  is overriden. Normally the toolkit creates a tool panel to the left with a toolbar and brush settings, but this toolkit instead creates additional tabs in-place of where the regular world outliner/details panel used to be. 

![alt text](image-9.png)

This works similar to the built-in Animation Mode. But it also manages additional widgets that are drawn on top of the editor viewport, which is used for the 3D text.

![alt text](image-10.png)

## Slate Stuff


## Filter/Selection System


## Digging source code
I used Visual Studio during development as the RAM consumption of [10x](https://10xeditor.com/) is too heavy to use for Unreal Engine projects on my PC, but I missed the speed and search functionality. 

I think a bandaid that worked suprisingly well was to make some shell scripts that wrapped [ripgrep](https://github.com/BurntSushi/ripgrep) to search for fixed strings specifically in the Unreal Engine Source/Plugin directories, when searching for engine strings it doesn't miss anything and it's many times faster than searching through Visual Studio.

![alt text](image-7.png)

PureRef was also quite useful when trying to reverse-engineer bugs and how undocumented stuff works, usually when I reverse engineer something it's like building a tree/graph out of possible solutions and eleminating the branches one by one until something works nicely. During those times it's nice to be able to draw ad-hoc annotations, and by using text it can also become a spatial string clipboard.


![alt text](image-6.png)
