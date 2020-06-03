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

/*
 * Initializes the page by loading all comments and the map.
*/
function initPage() {
    getComments(0);
    initMap();
}

/*
 * Creates a map and adds it to the page.
*/
function initMap() {
	const map = new google.maps.Map(
      document.getElementById('map'),
      {center: {lat: 37.406, lng: -122.021}, zoom: 18, mapTypeId: 'satellite',
      styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
      });
      map.setTilt(45);
      var pikachuImage = {
          url: '/images/pikachu.png',
          scaledSize: new google.maps.Size(68, 60.54),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
      }
      pikachuMarker = new google.maps.Marker({
    	map: map,
        icon: pikachuImage,
    	draggable: true,
    	animation: google.maps.Animation.DROP,
    	position: {lat: 37.406, lng: -122.021},
        title: 'Welcome to Moffett Place!'
  	  });
  	  pikachuMarker.addListener('click', toggleBounce);
}

/*
 * Clicking on the marker results in a bounce animation.
*/
function toggleBounce() {
  if (pikachuMarker.getAnimation() !== null) {
    pikachuMarker.setAnimation(null);
  } else {
    pikachuMarker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

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
    getComments(numDisplay);
}

/*
 * Deletes all comments on the page.
*/
async function deleteAllComments() {
    const response = await fetch('/delete-data', {method: 'POST'});
    const emptyJson = await response.json();
    if (response.status == 200) {
        getComments(0);
    }
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
