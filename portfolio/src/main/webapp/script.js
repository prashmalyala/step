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
 * Creates a stylized map with landmarks and adds it to the page.
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
      // Allows viewer to see an angled view of buildings in close view.
      map.setTilt(45);
      // Adding all images and setting their marker sizes.
      var pikachuImage = {
          url: '/images/pikachu.png',
          scaledSize: new google.maps.Size(68, 60.54),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
      }
      var charmanderImage = {
          url: '/images/charmander.png',
          scaledSize: new google.maps.Size(53.2, 60),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
      }
      var eeveeImage = {
          url: '/images/eevee.png',
          scaledSize: new google.maps.Size(60, 60),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
      }
      var squirtleImage = {
          url: '/images/squirtle.png',
          scaledSize: new google.maps.Size(60, 60),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
      }
      var bulbasaurImage = {
          url: '/images/bulbasaur.png',
          scaledSize: new google.maps.Size(102.22, 58.11),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0)
      }

	  // Assigning all image markers an info window and position on the map.
      addLandmark(
          map, 37.406, -122.021, 'Google Sunnyvale Campus',
          'Welcome to Google Sunnyvale!', pikachuImage
      );
      addLandmark(
          map, 37.266608, -122.029627, 'Saratoga High School',
          'Welcome to Saratoga High!', charmanderImage
      );
      addLandmark(
          map, 42.335693, -71.071548, 'Boston University',
          'Welcome to the Boston University Medical Campus!', bulbasaurImage
      );
      addLandmark(
          map, 37.382739, -121.969296, 'Netskope',
          'Welcome to Netskope!', eeveeImage
      );
      addLandmark(
          map, 37.871958, -122.258583, 'UC Berkeley',
          'Welcome to Cal Berkeley!', squirtleImage
      );
}

/** Adds a marker that shows an info window when clicked. */
function addLandmark(map, lat, lng, title, description, icon) {
  const marker = new google.maps.Marker(
      {position: {lat: lat, lng: lng}, map: map, title: title, icon: icon,
      animation: google.maps.Animation.DROP});
  const infoWindow = new google.maps.InfoWindow({content: description});
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
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
