// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <GetUserSnippet>
import { Client, GraphRequestOptions, PageCollection, PageIterator } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { endOfWeek, startOfWeek } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { User, Event, Message, Attachment } from 'microsoft-graph';

let graphClient: Client | undefined = undefined;

function ensureClient(authProvider: AuthCodeMSALBrowserAuthenticationProvider) {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
  }

  return graphClient;
}

export async function getUser(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<User> {
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  const user: User = await graphClient!.api('/me')
    // Only retrieve the specific fields needed
    .select('displayName,mail,mailboxSettings,userPrincipalName')
    .get();

  return user;
}
// </GetUserSnippet>

// <GetUserWeekCalendarSnippet>
export async function getUserWeekCalendar(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  timeZone: string): Promise<Event[]> {
  ensureClient(authProvider);

  // Generate startDateTime and endDateTime query params
  // to display a 7-day window
  const now = new Date();
  const startDateTime = zonedTimeToUtc(startOfWeek(now), timeZone).toISOString();
  const endDateTime = zonedTimeToUtc(endOfWeek(now), timeZone).toISOString();
  // console.log(startDateTime);
  // GET /me/calendarview?startDateTime=''&endDateTime=''
  // &$select=subject,organizer,start,end
  // &$orderby=start/dateTime
  // &$top=50
  // startDateTime=2021-01-01T00:00:00-08:00&endDateTime=2024-01-01T00:00:00-08:00&$top=500
  var total_events: Event[] = [];

  for (let i = 0; i < 13; i++) {
    // let res_1 = await getEventsBetweenRange("?startDateTime=" + (2013 + i) + "-01-01T00:00:00-08:00&endDateTime=" + (2014 + i) + "-01-01T00:00:00-08:00&$top=500", options);
    // res.push(...res_1.value);

    var response: PageCollection = await graphClient!
      .api('/me/calendarview')
      .header('Prefer', `outlook.timezone="${timeZone}"`)
      .query({ startDateTime: (2013 + i) + "-01-01T00:00:00-08:00", endDateTime: (2014 + i) + "-01-01T00:00:00-08:00" })
      .select('subject,organizer,start,end')
      .orderby('start/dateTime')
      .top(500)
      .get();

    if (response["@odata.nextLink"]) {
      // Presence of the nextLink property indicates more results are available
      // Use a page iterator to get all results
      var events: Event[] = [];

      // Must include the time zone header in page
      // requests too
      var options: GraphRequestOptions = {
        headers: { 'Prefer': `outlook.timezone="${timeZone}"` }
      };

      var pageIterator = new PageIterator(graphClient!, response, (event) => {
        events.push(event);
        return true;
      }, options);

      await pageIterator.iterate();

      // return events;
      total_events.push(...events);
    } else {

      total_events.push(...response.value);
    }
  }

  return total_events;
}
// </GetUserWeekCalendarSnippet>

// <CreateEventSnippet>
export async function createEvent(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  newEvent: Event): Promise<Event> {
  ensureClient(authProvider);

  // POST /me/events
  // JSON representation of the new event is sent in the
  // request body
  return await graphClient!
    .api('/me/events')
    .post(newEvent);
}
// </CreateEventSnippet>

// <GetMessages>
export async function getMessages(authProvider: AuthCodeMSALBrowserAuthenticationProvider, mailFolder: String): Promise<Message[]> {
  ensureClient(authProvider);

  var response = await graphClient!
    .api('/me/mailFolders/' + mailFolder + "/messages")
    .top(50)
    .get();
  return response.value;

  // console.log('Inbox Messages ---->', typeof response);
}
// </GetMessages>

// <CreateMessageSnippet>
export async function createMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  newMessage: Message): Promise<Message> {
  ensureClient(authProvider);

  // POST /me/events
  // JSON representation of the new event is sent in the
  // request body
  return await graphClient!
    .api('/me/messages')
    .post(newMessage);
}
// </CreateMessageSnippet>

// <ReplyMessageSnippet>
export async function replyMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider, newReplyMessage: any, mailId: String) : Promise<void> {
  ensureClient(authProvider);
  var res = await graphClient!.api('me/messages/' + mailId + "/reply").post(newReplyMessage);
  console.log("replyres --->", res);
}
// </ReplyMessageSnippet>

// <ReplyMessageSnippet>
export async function forwardMessage(authProvider: AuthCodeMSALBrowserAuthenticationProvider, newReplyMessage: any, mailId: String) : Promise<void> {
  ensureClient(authProvider);
  await graphClient!.api('me/messages/' + mailId + "/forward").post(newReplyMessage);
}
// </ReplyMessageSnippet>


// <GetMessageAttachments>
export async function getMessageAttachments(authProvider: AuthCodeMSALBrowserAuthenticationProvider, mailFolder: String, mailId: String): Promise<any> {
  ensureClient(authProvider);
// IMessageAttachmentsCollectionPage attachments
  var response = await graphClient!
    .api('/me/mailFolders/' + mailFolder + "/messages/" + mailId + "/attachments")
    .get();
//  return response.value;
  // console.log('attachment response --->', response.value);
  return response.value

  // console.log('Inbox Messages ---->', typeof response);
}
// </GetMessageAttachments>