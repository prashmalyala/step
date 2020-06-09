// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import java.util.*;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

      long meetingDuration = request.getDuration(); // duration of the meeting in minutes

      // duration exceeding a day is not possible
      if (meetingDuration > TimeRange.WHOLE_DAY.duration()) {
          return Arrays.asList();
      }

      // no events implies no conflicts
      if (events.isEmpty()) {
          return Arrays.asList(TimeRange.WHOLE_DAY);
      }

      Collection<String> meetAttendees = request.getAttendees(); // those needed at meeting
      Collection<String> optionalAttendees = request.getOptionalAttendees(); // those optional at meeting

      Set<TimeRange> busyTimes = new HashSet<>(); // mandatory attendee event times
      Set<TimeRange> busyOptionalTimes = new HashSet<>(); // mandatory + optional attendee event times

      Collection<TimeRange> availableTimes = new ArrayList<>(); // available times for mandatory attendees
      Collection<TimeRange> availableTimesOptional = new ArrayList<>(); // available times, optionals included

      // compiles a list of mandatory attendee busy times AND a list of mandatory + optional busy times
      for (Event event : events) {
          Set<String> eventAttendees = event.getAttendees();
          TimeRange eventSpan = event.getWhen();
          // if mandatory attendee has an event, consider it
          if (Collections.disjoint(meetAttendees, eventAttendees) == false) {
              busyTimes.add(eventSpan);
              busyOptionalTimes.add(eventSpan);
          } else {
              // if no mandatory attendees are busy, then check optional attendees
              if (Collections.disjoint(optionalAttendees, eventAttendees) == false) {
                  busyOptionalTimes.add(eventSpan);
              }
          }
      }

      List<TimeRange> busyTimesSorted = new ArrayList<>();
      List<TimeRange> sortedBusyOptionalTimes = new ArrayList<>();

      busyTimesSorted.addAll(busyTimes);
      Collections.sort(busyTimesSorted, TimeRange.ORDER_BY_START);

      sortedBusyOptionalTimes.addAll(busyOptionalTimes);
      Collections.sort(sortedBusyOptionalTimes, TimeRange.ORDER_BY_START);

      // possible that no meet attendees are busy
      if (busyTimesSorted.size() == 0) {
          // possible that no optional attendees are busy
          if (sortedBusyOptionalTimes.size() == 0) {
              return Arrays.asList(TimeRange.WHOLE_DAY);
          }
          // otherwise, schedule is determined by the optional attendees
          helper(sortedBusyOptionalTimes, meetingDuration, availableTimesOptional);
          return availableTimesOptional;
      }
      else {
          // first try mandatory + optional both attending the meeting
          helper(sortedBusyOptionalTimes, meetingDuration, availableTimesOptional);

          // if we have time(s) for both, return them
          if (availableTimesOptional.size() != 0) {
              return availableTimesOptional;
          }

          // otherwise, only look at mandatory attendees
          helper(busyTimesSorted, meetingDuration, availableTimes);

          return availableTimes;
        }
    }

  public void helper(List<TimeRange> busyTimesSorted, long meetingDuration, Collection<TimeRange> availableTimes) {
      // meeting at the beginning of the day
          TimeRange firstTime = busyTimesSorted.get(0);
          if (firstTime.start() >= meetingDuration) {
              availableTimes.add(TimeRange.fromStartEnd(TimeRange.START_OF_DAY, firstTime.start(), false));
          }

          // meetings in between the day
          TimeRange priorTime = firstTime;
          for (int i = 0; i < busyTimesSorted.size() - 1; i++) {
              TimeRange currentTime = busyTimesSorted.get(i);
              TimeRange nextTime = busyTimesSorted.get(i + 1);
              if (!priorTime.contains(currentTime)) {
                  priorTime = currentTime;
              }
              int gap = nextTime.start() - priorTime.end();
              if (priorTime.overlaps(nextTime) || gap < meetingDuration) {
                  continue;
              }
              else {
                  availableTimes.add(TimeRange.fromStartEnd(priorTime.end(), nextTime.start(), false));
              }
          }

        // meetings at the end of the day
        Collections.sort(busyTimesSorted, TimeRange.ORDER_BY_END);
        TimeRange lastEvent = busyTimesSorted.get(busyTimesSorted.size() - 1);
        if (TimeRange.END_OF_DAY - lastEvent.end() + 1 >= meetingDuration) {
            availableTimes.add(TimeRange.fromStartEnd(lastEvent.end(), TimeRange.END_OF_DAY, true));
        }
    }
}
