// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, {
  useContext,
  createContext,
  useState,
  MouseEventHandler,
  useEffect,
} from "react";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";

import { getUser, getMessages } from "./GraphService";
import config from "./Config";
import axios from "axios";

// <AppContextSnippet>
export interface AppUser {
  displayName?: string;
  email?: string;
  avatar?: string;
  timeZone?: string;
  timeFormat?: string;
}

export interface AppError {
  message: string;
  debug?: string;
}

type AppContext = {
  user?: AppUser;
  error?: AppError;
  signIn?: MouseEventHandler<HTMLElement>;
  signOut?: MouseEventHandler<HTMLElement>;
  displayError?: Function;
  clearError?: Function;
  authProvider?: AuthCodeMSALBrowserAuthenticationProvider;
};

const appContext = createContext<AppContext>({
  user: undefined,
  error: undefined,
  signIn: undefined,
  signOut: undefined,
  displayError: undefined,
  clearError: undefined,
  authProvider: undefined,
});

export function useAppContext(): AppContext {
  return useContext(appContext);
}

interface ProvideAppContextProps {
  children: React.ReactNode;
}

export default function ProvideAppContext({
  children,
}: ProvideAppContextProps) {
  const auth = useProvideAppContext();
  return <appContext.Provider value={auth}>{children}</appContext.Provider>;
}
// </AppContextSnippet>

function useProvideAppContext() {
  const msal = useMsal();
  const [user, setUser] = useState<AppUser | undefined>(undefined);
  const [error, setError] = useState<AppError | undefined>(undefined);

  const displayError = (message: string, debug?: string) => {
    setError({ message, debug });
  };

  const clearError = () => {
    setError(undefined);
  };

  // <AuthProviderSnippet>
  // Used by the Graph SDK to authenticate API calls
  const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
    msal.instance as PublicClientApplication,
    {
      account: msal.instance.getActiveAccount()!,
      scopes: config.scopes,
      interactionType: InteractionType.Popup,
    }
  );
  // </AuthProviderSnippet>

  // <UseEffectSnippet>
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          // Check if user is already signed in
          const account = msal.instance.getActiveAccount();
          if (account) {
            // Get the user from Microsoft Graph
            const user = await getUser(authProvider);

            setUser({
              displayName: user.displayName || "",
              email: user.mail || user.userPrincipalName || "",
              timeFormat: user.mailboxSettings?.timeFormat || "h:mm a",
              timeZone: user.mailboxSettings?.timeZone || "UTC",
            });
          }
        } catch (err: any) {
          displayError(err.message);
        }
      }
    };
    checkUser();
  });
  // </UseEffectSnippet>

  // <SignInSnippet>
  const signIn = async () => {
    var res = await msal.instance.loginPopup({
      scopes: config.scopes,
      prompt: "select_account",
    });
    
    /* Get Authorization Code after Login */
    var obj : any = sessionStorage.getItem('msal.3cf476da-a75d-4767-a024-4af6df349dd0.active-account-filters');
    if(obj !== undefined) {
      let obj_json = JSON.parse(obj);
      let obj1 : any = sessionStorage.getItem(obj_json['homeAccountId'] + "-login.windows.net-refreshtoken-3cf476da-a75d-4767-a024-4af6df349dd0----");
      if(obj1 !== undefined){
        var auth_code = JSON.parse(obj1)['secret'];
        console.log("auth_code ------>", auth_code);
      }
    }


    // Get the user from Microsoft Graph
    const user = await getUser(authProvider);

    // Add user to db.
    await axios
      .post("http://localhost:5000/api/users/signup", {
        useremail: user.mail,
        username: user.displayName,
        authProvider: authProvider,
        id: user.id,
      })
      .then((res) => {
        localStorage.setItem("usertype", res.data.usertype);
      })
      .catch((err) => {
        console.log(err);
      });

    let start = user.mail?.indexOf("@");
    let last = user.mail?.length;
    let usermail = user.mail;
    let organization = (usermail = undefined
      ? ""
      : usermail?.slice(start, last));
    let inboxmessages = await getMessages(authProvider, "Inbox");
    let sentmessages = await getMessages(authProvider, "sentitems");
    let messagelist: string[] = [];
    inboxmessages.map((inboxmessage: any) => {
      let toRecipients = inboxmessage.toRecipients;
      let ccRecipients = inboxmessage.ccRecipients;
      let bccRecipients = inboxmessage.bccRecipients;
      toRecipients.map((toRecipient: any) => {
        if (
          messagelist.includes(toRecipient.emailAddress.address) == false &&
          toRecipient.emailAddress.address.includes(organization) == false
        )
          messagelist.push(toRecipient.emailAddress.address);
      });
      ccRecipients.map((ccRecipient: any) => {
        if (
          messagelist.includes(ccRecipient.emailAddress.address) == false &&
          ccRecipient.emailAddress.address.includes(organization) == false
        )
          messagelist.push(ccRecipient.emailAddress.address);
      });
      bccRecipients.map((bccRecipient: any) => {
        if (
          messagelist.includes(bccRecipient.emailAddress.address) == false &&
          bccRecipient.emailAddress.address.includes(organization) == false
        )
          messagelist.push(bccRecipient.emailAddress.address);
      });
    });
    sentmessages.map((sentmessage: any) => {
      let toRecipients = sentmessage.toRecipients;
      let ccRecipients = sentmessage.ccRecipients;
      let bccRecipients = sentmessage.bccRecipients;
      toRecipients.map((toRecipient: any) => {
        if (
          messagelist.includes(toRecipient.emailAddress.address) == false &&
          toRecipient.emailAddress.address.includes(organization) == false
        )
          messagelist.push(toRecipient.emailAddress.address);
      });
      ccRecipients.map((ccRecipient: any) => {
        if (
          messagelist.includes(ccRecipient.emailAddress.address) == false &&
          ccRecipient.emailAddress.address.includes(organization) == false
        )
          messagelist.push(ccRecipient.emailAddress.address);
      });
      bccRecipients.map((bccRecipient: any) => {
        if (
          messagelist.includes(bccRecipient.emailAddress.address) == false &&
          bccRecipient.emailAddress.address.includes(organization) == false
        )
          messagelist.push(bccRecipient.emailAddress.address);
      });
    });

    axios
      .post("http://localhost:5000/api/users/writeemailaddress", {
        emailaddresslist: messagelist,
        useremail: user.mail,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    // console.log("messsagelist---->", messagelist);

    setUser({
      displayName: user.displayName || "",
      email: user.mail || user.userPrincipalName || "",
      timeFormat: user.mailboxSettings?.timeFormat || "",
      timeZone: user.mailboxSettings?.timeZone || "UTC",
    });
  };
  // </SignInSnippet>

  // <SignOutSnippet>
  const signOut = async () => {
    await msal.instance.logoutPopup();
    setUser(undefined);
  };
  // </SignOutSnippet>

  return {
    user,
    error,
    signIn,
    signOut,
    displayError,
    clearError,
    authProvider,
  };
}
