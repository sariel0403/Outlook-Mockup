// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { Table } from "react-bootstrap";
import { findIana } from "windows-iana";
import { Event } from "microsoft-graph";
import { AuthenticatedTemplate } from "@azure/msal-react";
import { add, format, getDay, parseISO } from "date-fns";
import { endOfWeek, startOfWeek } from "date-fns/esm";

import { getUserWeekCalendar } from "./GraphService";
import { useAppContext } from "./AppContext";
import CalendarDayRow from "./CalendarDayRow";
import "./Calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

const localizer = momentLocalizer(moment);

const StringToDate = (str: any) => {
  let year: any = str.slice(0, 4);
  let month: any = str.slice(5, 7);
  let day: any = str.slice(8, 10);
  let hour: any = str.slice(11, 13);
  let minute: any = str.slice(14, 16);
  let second: any = str.slice(17, 19);
  let date = new Date(year, month - 1, day, hour, minute, second);
  return date;
};

export default function MyCalendar() {
  const app = useAppContext();

  const [events, setEvents] = useState();

  useEffect(() => {
    const loadEvents = async () => {
      if (app.user && !events) {
        try {
          const ianaTimeZones = findIana(app.user?.timeZone!);
          const events = await getUserWeekCalendar(
            app.authProvider!,
            ianaTimeZones[0].valueOf()
          );
          console.log(events);
          // /* */
          var events_list: any = [];
          for (let i = 0; events[i]; i++) {
            let title: any = events[i]?.subject;
            let id: any = i;
            // console.log(events[0].start?.dateTime)
            let start: any = StringToDate(events[i].start?.dateTime);
            let end: any = StringToDate(events[i].end?.dateTime);
            let event = { id, title, start, end };
            events_list.push(event);
          }
          setEvents(events_list);
        } catch (err) {
          const error = err as Error;
          app.displayError!(error.message);
        }
      }
    };

    loadEvents();
  });

  // <ReturnSnippet>
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);

  return (
    <AuthenticatedTemplate>
      <div className="mb-3">
        <RouterNavLink to="/newevent" className="btn btn-light btn-sm">
          New event
        </RouterNavLink>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 1000 }}
      />
    </AuthenticatedTemplate>
  );
  // </ReturnSnippet>
}
