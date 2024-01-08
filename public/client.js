// function that supports searching for artworks based on title, artist and category
function searchArtworks(){
    // getting the title, artist and category values that the user has added
    let titleValue = document.getElementById("artwork_title").value;
    let artistValue = document.getElementById("artwork_artist").value;
    let categoryValue = document.getElementById("artwork_category").value;
    
    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("GET", `http://localhost:3000/artworksresults?title=${titleValue}&artist=${artistValue}&category=${categoryValue}`);
	xhttp.send();
}

// function to add likes to artworks
function addLike(){
    // getting the id of the artwork that I need to add the like to
    let currentUrl = window.location.href;
    let artworkId = currentUrl.slice(31);

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            // reloading the artwork page
            location.href = `http://localhost:3000/artworks/${artworkId}`;
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("GET", `http://localhost:3000/likes?artworkid=${artworkId}`);
	xhttp.send();
}

// function to remove the like from the artwork
function removeLike(){
    // getting the id of the artwork to remove the like from 
    let currentUrl = window.location.href;
    let artworkId = currentUrl.slice(31);

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            // reloading the artwork page
            location.href = `http://localhost:3000/artworks/${artworkId}`;
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("PUT", `http://localhost:3000/likes?artworkid=${artworkId}`);
	xhttp.send();
}

// function to add review to the artwork
function addReview(){
    // getting the id of the artwork that I need to add the review to 
    let currentUrl = window.location.href;
    let artworkId = currentUrl.slice(31);
    // getting the text of the review
    let textValue = document.getElementById("review").value;

    // creating the data object that needs to be sent to the server
    let data = {artworkid: artworkId, text: textValue};

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            // reloading the artwork page
            location.href = `http://localhost:3000/artworks/${artworkId}`;
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("POST", `http://localhost:3000/reviews`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(data));
}

// function to remove review from the artwork
function removeReview(){
    // getting the id of the artwork that I need to remove the review from 
    let currentUrl = window.location.href;
    let artworkId = currentUrl.slice(31);

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            // reloading the artwork page
            location.href = `http://localhost:3000/artworks/${artworkId}`;
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("PUT", `http://localhost:3000/reviews?artworkid=${artworkId}`);
	xhttp.send();
}

// function to add workshop 
function addWorkshop(){
    // getting the title of the workshop
    let titleValue = document.getElementById("workshop_title").value;
    let data = {title: titleValue};

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			// alerting the user that the workshop has been added successfully
            alert("Workshop has been added successfully!");            
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("POST", `http://localhost:3000/workshop`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(data));
}

// function to add artwork
function addArtwork(){
    // getting the title, year, category, medium, description and poster values
    let titleValue = document.getElementById("new_artwork_title").value;
    let yearValue = document.getElementById("new_artwork_year").value;
    let categoryValue = document.getElementById("new_artwork_category").value;
    let mediumValue = document.getElementById("new_artwork_medium").value;
    let descriptionValue = document.getElementById("new_artwork_description").value;
    let posterValue = document.getElementById("new_artwork_poster").value;

    // creating the data object that needs to be sent to the server
    let data = {title: titleValue, year: yearValue, category: categoryValue, medium: mediumValue, description: descriptionValue, poster: posterValue};

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
            // alerting the user that the artwork has been added successfully
            alert("The artwork has been added successfully!");
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("POST", `http://localhost:3000/artwork`);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(data));
}

// function to enroll the user in the workshop
function enrollInWorkshop(){
    alert("You have successfully enrolled in the workshop!");
}

// function to follow the artist
function followArtist(){
    // getting the id of the artist to follow
    let currentUrl = window.location.href;
    let artistId = currentUrl.slice(28);

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("GET", `http://localhost:3000/follow?artistid=${artistId}`);
	xhttp.send();
}

// function to unfollow the artist
function unfollowArtist(){
    // getting the id of the artist to unfollow
    let currentUrl = window.location.href;
    let artistId = currentUrl.slice(28);

    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("GET", `http://localhost:3000/unfollow?artistid=${artistId}`);
	xhttp.send();
}

// function to change accounts
function changeAccount(){
    // create an xml http request
    xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status == 200){
			// reloading the user's profile page
            location.href = `http://localhost:3000/userprofile`;
		}
	}
	
	// creating and sending the request to the server
	xhttp.open("PUT", `http://localhost:3000/account`);
	xhttp.send();
}