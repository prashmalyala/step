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

/**
 * Adds a random greeting to the page.
 */
function addRandomFact() {
  const greetings =
      ['I\'m a huge basketball fan.', 'I enjoy going on frequent walks.', 'I\'m an aspiring Product Manager.', 'I dream of running my own film and animation studio some day.', 'I love Pokemon.'];

  // Pick a random greeting.
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Add it to the page.
  const greetingContainer = document.getElementById('greeting-container');
  greetingContainer.innerText = greeting;
}

/*
 * Fetch the JSON string of comments, parse it, and add it to the DOM.
*/
async function getComments(numComments) {
  const response = await fetch('/data?numComments=' + numComments);
  const chosenComments = await response.json();
  const commentsListDOM = document.getElementById('comments-container');
  commentsListDOM.innerHTML = '';
  console.log(chosenComments.length);
  for (var i = 0; i < chosenComments.length; i++) {
      commentsListDOM.appendChild(createListElement(chosenComments[i]));
  }
  if (chosenComments.length == 0) {
      commentsListDOM.innerHTML = 'No comments displayed.';
  }
}

/*
 * Retrieves user input for number of comments they want displayed.
*/
function displayNumComments() {
    // fetch the data from the HTML form
    const numDisplay = document.getElementById("comment-number").value;
    console.log(numDisplay);
    getComments(numDisplay);
}

/** Creates a <li> element with commenter name and their comment text as a sublist. */
function createListElement(comment) {
  const nameEl = document.createElement('li');
  const commentContainer = document.createElement('ul');
  const commentEl = document.createElement('li');
  nameEl.innerText = comment.name;
  commentEl.innerText = comment.message;
  commentContainer.appendChild(commentEl);
  nameEl.appendChild(commentContainer);
  return nameEl;
}
