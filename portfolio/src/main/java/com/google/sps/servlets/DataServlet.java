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

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;
import java.util.*;

/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  private class Comment {
      String name;
      String message;
      long timestamp;

      public Comment(String name, String message, long timestamp) {
          this.name = name;
          this.message = message;
          this.timestamp = timestamp;
      }
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Query the datastore for Comment entities
    Query query = new Query("Comment").addSort("timestamp", SortDirection.ASCENDING);
    PreparedQuery results = datastore.prepare(query);

    List<Comment> comments = new ArrayList<>();
    for (Entity entity : results.asIterable()) {
      String name = (String) entity.getProperty("name");
      String message = (String) entity.getProperty("message");
      long timestamp = (long) entity.getProperty("timestamp");

      Comment comment = new Comment(name, message, timestamp);
      comments.add(comment);
    }

    Integer numComments = Integer.parseInt(request.getParameter("numComments"));
    // ensure numComments falls into bounded range, show all comments if input is 0
    if (numComments > 0) {
        if (numComments >= comments.size()) {
            comments = comments.subList(0, comments.size());
        }
        else {
            comments = comments.subList(0, numComments);
        }
    }
    
    Gson gson = new Gson();
    String json = gson.toJson(comments);
    // Set response to the JSON string
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      // Get form input
      String name = getParameter(request, "name-input", "");
      String message = getParameter(request, "comment-input", "");
      long timestamp = System.currentTimeMillis();

      Entity commentEntity = new Entity("Comment");
      commentEntity.setProperty("name", name);
      commentEntity.setProperty("message", message);
      commentEntity.setProperty("timestamp", timestamp);

      datastore.put(commentEntity);

      // Redirect to the home page (index.html)
      response.sendRedirect("/index.html");
  }

  /**
   * @return the request parameter, or the default value if the parameter
   *         was not specified by the client
   */
  private String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null) {
      return defaultValue;
    }
    return value;
  }
}
