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

      // duration exceeds a day, hence not possible
      if (meetingDuration > TimeRange.WHOLE_DAY.duration()) {
          return Arrays.asList();
      }

      // no events, hence no conflicts
      if (events.isEmpty()) {
          return Arrays.asList(TimeRange.WHOLE_DAY);
      }

      Collection<String> meetAttendees = request.getAttendees(); // those needed at meeting
      Collection<String> optionalAttendees = request.getOptionalAttendees(); // those optional at meeting

      Set<TimeRange> busyTimes = new HashSet<>(); // mandatory attendee event times (includes overlaps)
      Set<TimeRange> busyOptionalTimes = new HashSet<>(); // mandatory + optional attendee event times

      Collection<TimeRange> availableTimes = new ArrayList<>(); // meeting times for mandatory attendees
      Collection<TimeRange> availableTimesOptional = new ArrayList<>(); // meeting times, optionals included

      // compiles a list of mandatory attendee busy times and a list of mandatory + optional busy times
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

      /* // returned: <[Range: [0, 1440), Range: [480, 510), Range: [540, 570)]>
      if (availableTimesOptional.size() == 0) {
          return sortedBusyOptionalTimes;
      }
      */

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

          /* // returned: <[Range: [0, 1440), Range: [480, 510), Range: [540, 570)]>
          if (availableTimesOptional.size() == 0) {
            return sortedBusyOptionalTimes;
        }
        */

          // we first want to try getting everyone to attend the meeting
          helper(sortedBusyOptionalTimes, meetingDuration, availableTimesOptional);


          //ENTERING THIS WHEN WE SHOULD NOT BE
          // if we have a time for everyone, return
          if (availableTimesOptional.size() != 0) {
              return availableTimesOptional;
          }


          // otherwise, we must look at only mandatory attendees
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
