// requiring the necessary modules
const express = require('express');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const app = express();
const mongoose = require("mongoose");
const User = require("./UserModel");
const Artwork = require("./ArtworkModel");

// add a template engine to your app
app.set("view engine", "pug");
app.set("views", "views");

// connecting to the openGallery database
mongoose.connect('mongodb://127.0.0.1:27017/openGallery');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
	app.listen(3000);
	console.log('Server is listening at http://localhost:3000');
});

// creating a MongoDBSession
const store = new MongoDBSession({
    uri: 'mongodb://127.0.0.1:27017/openGallery',
    collection: 'sessions',
});

// Using the session middleware
app.use(session({
	secret: 'some secret here',
	resave: true,
	saveUninitialized: true,
    store: store
}));

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// GET request to '/userprofile' to render the user's profile page
app.get("/userprofile", auth, userInformation);

// send GET request to /logout route to logout
app.get("/logout", logout);  

// GET request to get the list of all the artworks that meet the search criteria
app.get("/artworksresults", parseQuery);

// GET request to get the page of artwork with artworkID
app.get("/artworks/:artworkID", sendSingleArtwork);

// GET request to get the page of the artist with uID
app.get("/users/:uID", sendSingleUser);

// finding the artwork that has the provided artworkID
app.param("artworkID", function(req, res, next, value){
    // finding the artwork by its artwork id
    Artwork.findById(value)
		.then(result => {
			if (!result) {
				res.status(404).send("Artwork ID does not exist.");
				return;
			}

			req.artwork = result;
            next();
		});
})

// finding the user that has the provided uID
app.param("uID", function(req, res, next, value){
    // finding the user by its user id
    User.findById(value)
		.then(result => {
			if (!result) {
				res.status(404).send("User ID does not exist.");
				return;
			}

			req.user = result;
            next();
		});
})

// checking if it is a post request to the resource '/login'
app.post("/login", async (req, res) => {
    // getting the username and password
    let data = req.body;
    let username = data.username;
    let password = data.password;

    // finding the user with the username
    let user = await User.findOne({username});
    
    // if the user does not exist, redirecting them to the register page
    if(!user){
        return res.redirect("/register");
    }

    // checking if they have entered the correct password
    if(!(password === user.password)){
        res.status(401).send("Not authorized. Invalid password.");
    }

    // logging in the user
    req.session.auth = true;
    req.session.username = username;
    req.session.password = password;
    req.session.uid = user._id.toString();
    req.session.reviews = user.reviews;
    req.session.likes = user.likes;
    req.session.artworks = user.artworks;
    req.session.type = user.type;
    req.session.logedin = true;

    // redirecting to the user profile page
    res.redirect("/userprofile");
});

// function to logout the user
function logout(req, res, next) {
    // checking if the user's loged in 
	if (req.session.logedin) {
        // logging out the user
		req.session.logedin = false;
		req.session.username = undefined;
        req.session.password = undefined;
        req.session.uid = undefined;
        req.session.auth = false;
		res.status(200).send("Logged out.");
	} else {
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

// checking if it is a post request to the resource '/register'
app.post("/register", async (req, res) => {
    // getting the username and password
    let data = req.body;
    let username = data.username;
    let password = data.password;

    // finding a user with the username
    let user = await User.findOne({username});

    // if the user exists, redirecting them to the register page
    if(user){
        return res.redirect('/register');
    }

    // creating the user
    user = new User({
        username, 
        password, 
        type: "patron", 
        reviews: [], 
        likes: [],
        artworks: [],
        workshops: [],
        notifications: [],
        followers: [],
        following: []
    });

    // saving the user and redirecting to the login page
    await user.save();
    res.redirect('/login');
});

// checking if it is a get request to the resource '/artworks'
app.get("/artworks", (req, res, next) => {
    // code for pagination
    let params = [];
	for (prop in req.query) {
		if (prop == "page") {
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");

	req.query.limit = 10;

	try {
		req.query.page = req.query.page || 1;
		req.query.page = Number(req.query.page);
		if (req.query.page < 1) {
			req.query.page = 1;
		}
	} catch {
		req.query.page = 1;
	}

    let startIndex = ((req.query.page - 1) * req.query.limit);
	let amount = req.query.limit;

    // finding all the artworks
    Artwork.find()
        .limit(amount)
        .skip(startIndex)
        .exec()
		.then(results => {
            res.format({
                // rendering the all_artworks.pug file
                "text/html": () => { res.render("pages/all_artworks", { artworks: results, qstring: req.qstring, current: req.query.page }) },
                "application/json": () => { res.status(200).json(results) }
            });
		})
		.catch(err => {
			throw err;
		});    
});

// async function to send single user
async function sendSingleUser(req, res, next){
    // array to store all the artworks of the artist
    let userArtworks = [];

    // looping through the titles of each artwork
    for(let artwork of req.user.artworks){
        // finding the artwork by its title
        await Artwork.findOne()
            .where("Title").equals(artwork)
            .exec()
            .then(result => {
                if (!result) {
                    res.status(404).send("Artwork does not exist.");
                    return;
                }

                // adding the result to the array
                userArtworks.push(result);
            });
    }

    // rendering the artist.pug page
    res.render("pages/artist", {userArtworks: userArtworks, user: req.user});
}

// function to send single artwork
function sendSingleArtwork(req, res, next){
    // finding the artist of the artwork
    User.findOne()
        .where("username").equals(req.artwork.Artist)
        .exec()
        .then(result1 => {
            if (!result1) {
                res.status(404).send("User does not exist.");
                return;
            }

            // getting the id of the user
            let uid = result1._id;

            // rendering the artwork.pug page
            res.render("pages/artwork", { artwork: req.artwork, uid: uid });
        });
}

//authorization function
function auth(req, res, next){
    //check if there is a loggedin property set for the session
    if(!req.session.logedin){
        res.status(401).send("Unauthorized");
        return;
    }
    next();
}

// checking if it is a get request for the URL '/'
app.get("/", (req, res, next) => {
    req.session.auth = true;
    // rending the home.pug file and sending it as a response
    res.render("pages/home", {});
});

// checking if it is a get request for the URL '/login'
app.get("/login", (req, res, next) => {
    // rending the login.pug file and sending it as a response
    res.render("pages/login", {});
});

// checking if it is a get request for the URL '/register'
app.get("/register", (req, res, next) => {
    // rending the register.pug file and sending it as a response
    res.render("pages/register", {});
});

// checking if it is a get request for the URL '/addartwork'
app.get("/addartwork", (req, res, next) => {
    // checking if the user is authorized to view the add artwork page
    if(!req.session.logedin || req.session.type === "patron"){
        res.status(401).send("Unauthorized");
        return;
    }

    // rending the add_artwork.pug file and sending it as a response
    res.render("pages/add_artwork", {});
});

// checking if it is a get request for the URL '/addworkshop'
app.get("/addworkshop", (req, res, next) => {
    // checking if the user is authorized to view the add workshop page
    if(!req.session.logedin || req.session.type === "patron"){
        res.status(401).send("Unauthorized");
        return;
    }

    // rending the add_workshop.pug file and sending it as a response
    res.render("pages/add_workshop", {});
});

// checking if it is a get request for the URL '/searchartworks'
app.get("/searchartworks", (req, res, next) => {
    // rending the search_artworks.pug file and sending it as a response
    res.render("pages/search_artworks", {});
});

// checking if it is a post request to the resource '/workshop'
app.post("/workshop", (req, res, next) => {
    let data = {};
    // storing the data that was sent into data
    data = req.body;
    let titleValue = data.title;

    // finding the user by id
    User.findById(req.session.uid)
        .then(result3 => {
            if (!result3) {
                res.status(404).send("User ID does not exist.");
                return;
            }

            // adding the title into the user's workshops array
            result3.workshops.push(titleValue);

            // saving the updated user
            result3.save()
                .then(async result4 => {
                    res.status(200).send("successful");
                    // notification saying new workshop is added

                    // checking if the user has followers
                    if(result3.followers.length > 0){
                        // for each user id in the followers array
                        for(let u of result3.followers){
                            // finding the user by id
                            await User.findById(u)
                                .then(async result => {
                                    if (!result) {
                                        res.status(404).send("User ID does not exist.");
                                        return;
                                    }
        
                                    // adding the notification into the user's notifications array
                                    result.notifications.push(req.session.username + " has added a new workshop");

                                    // saving the updated user
                                    await result.save()
                                        .then(result4 => {
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                });
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating user.");
                });
        });
});

// checking if it is a post request to the resource '/artwork'
app.post("/artwork", async (req, res, next) => {
    let data = {};
    // storing the data that was sent into data
    data = req.body;

    // getting the title, year, category, medium, description and poster values
    let titleValue = data.title;
    let yearValue = data.year;
    let categoryValue = data.category;
    let mediumValue = data.medium;
    let descriptionValue = data.description;
    let posterValue = data.poster;

    // creating the artwork
    let a = new Artwork();
	a.Title = titleValue;
	a.Artist = req.session.username;
	a.Year = yearValue;
    a.Category = categoryValue;
    a.Medium = mediumValue;
    a.Description = descriptionValue;
    a.Poster = posterValue;
	a.Reviews = [];
	a.Likes = [];

    // saving the artwork
    await a.save();

    // finding the user by id
    User.findById(req.session.uid)
        .then(result3 => {
            if (!result3) {
                res.status(404).send("User ID does not exist.");
                return;
            }

            // adding the artwork's title into user's artworks array
            result3.artworks.push(titleValue);

            // saving the updated user
            result3.save()
                .then(async result4 => {
                    res.status(200).send("successful");

                    // checking if the user has followers
                    if(result3.followers.length > 0){
                        // looping through each uid in the followers array
                        for(let u of result3.followers){
                            // finding the user by id
                            await User.findById(u)
                                .then(async result => {
                                    if (!result) {
                                        res.status(404).send("User ID does not exist.");
                                        return;
                                    }
        
                                    // adding the notification into the user's notifications array
                                    result.notifications.push(req.session.username + " has added a new artwork");
                                    
                                    // saving the updated user
                                    await result.save()
                                        .then(result4 => {
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                });
                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating user.");
                });
        });
});

// async function to gather data for the user profile page
async function userInformation(req, res, next){
    // creating arrays to store the user's liked artworks, reviews and and artists they follow
    let likedArtworks = [];
    let reviews = [];
    let followingArtists = [];

    // finding the user by id
    await User.findById(req.session.uid)
        .then(async result3 => {
            if (!result3) {
                res.status(404).send("User ID does not exist.");
                return;
            }

            // checking if the user has liked any artworks
            if(result3.likes.length == 0){
                likedArtworks = [];
            }
            else{
                likedArtworks = [];
                // looping through the id of each artwork the user has liked
                for(let artworkId of result3.likes){
                    // finding the artwork by its id
                    await Artwork.findById(artworkId)
                        .then(result => {
                            if (!result) {
                                res.status(404).send("Artwork ID does not exist.");
                                return;
                            }

                            // adding the result into the array
                            likedArtworks.push(result);
                        });
                }
            }

            // checking if the user is following any artists
            if(result3.following.length == 0){
                followingArtists = [];
            }
            else{
                followingArtists = [];
                // looping through the id of each artist that the user is following
                for(let artistId of result3.following){
                    // finding the user by its id
                    await User.findById(artistId)
                        .then(result => {
                            if (!result) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // adding the result into the array
                            followingArtists.push(result);
                        });
                }
            }

            // checking if the user has added any reviews
            if(result3.reviews.length == 0){
                reviews = [];
            }
            else{
                reviews = [];
                // looping through each review that the user has added
                for(let review of result3.reviews){
                    // adding the review's text in the array
                    reviews.push(review.text);
                }
            }

            // rendering the user_information.pug file
            res.render("pages/user_information", {username: req.session.username, type: result3.type, likedArtworks: likedArtworks, followingArtists: followingArtists, notifications: result3.notifications, reviews: reviews});
        });
    return;
}

// function to parse the query parameters
function parseQuery(req, res, next){
    // getting the title, artist and category values
    let queryObj = req.query;
	let titleValue = queryObj.title;
	let artistValue = queryObj.artist;
    let categoryValue = queryObj.category;
    
    // code for supporting pagination
    let params = [];
	for (prop in req.query) {
		if (prop == "page") {
			continue;
		}
		params.push(prop + "=" + req.query[prop]);
	}
	req.qstring = params.join("&");

	req.query.limit = 10;

	try {
		req.query.page = req.query.page || 1;
		req.query.page = Number(req.query.page);
		if (req.query.page < 1) {
			req.query.page = 1;
		}
	} catch {
		req.query.page = 1;
	}

    if (!req.query.title) {
		req.query.title = "?";
	}

    if (!req.query.artist) {
		req.query.artist = "?";
	}

    if (!req.query.category) {
		req.query.category = "?";
	}

    let startIndex = ((req.query.page - 1) * req.query.limit);
	let amount = req.query.limit;

    // finding all the artworks that match the search criteria
    Artwork.find()
		.where("Title").regex(new RegExp(".*" + titleValue + ".*", "i"))
        .where("Artist").regex(new RegExp(".*" + artistValue + ".*", "i"))
        .where("Category").regex(new RegExp(".*" + categoryValue + ".*", "i"))
		.limit(amount)
		.skip(startIndex)
		.exec()
		.then(results => {
            res.format({
                // rendering the searched_artworks.pug file
                "text/html": () => { res.render("pages/searched_artworks", { artworks: results, qstring: req.qstring, current: req.query.page }) },
                "application/json": () => { res.status(200).json(results) }
            }); 
		})
		.catch(err => {
			throw err;
		}); 
}

// checking if it is a get request to the resource '/follow'
app.get("/follow", (req, res, next) => {
    // getting the id of the artist to follow
    let artistId = req.query.artistid;

    // finding the user by id
    User.findById(req.session.uid)
		.then(result => {
			if (!result) {
				res.status(404).send("User ID does not exist.");
				return;
			}

			// adding the artist id into the user's following list
            result.following.push(artistId);

            // saving the updated user
            result.save()
                .then(result2 => {
                    // finding the user by id
                    User.findById(artistId)
                        .then(result3 => {
                            if (!result3) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // adding the uid into the user's followers list
                            result3.followers.push(req.session.uid);

                            // saving the updated user
                            result3.save()
                                .then(result4 => {
                                    res.status(200).send("successful");
                                })
                                .catch(err => {
                                    res.status(500).send("Error updating user.");
                                });
                        });
                })
                .catch(err => {
                    res.status(500).send("Error updating user.");
                });
		}); 
});

// checking if it is a get request to the resource '/unfollow'
app.get("/unfollow", (req, res, next) =>{
    // getting the id of the artist to unfollow
    let artistId = req.query.artistid;

    // finding the user by id
    User.findById(req.session.uid)
		.then(result => {
			if (!result) {
				res.status(404).send("User ID does not exist.");
				return;
			}

            // removing the id of the artist from the user's following list
            let indexAid = result.following.indexOf(artistId);
            if(indexAid > -1){
                result.following.splice(indexAid, 1);
            }

            // saving the updated user
            result.save()
                .then(result2 => {
                    // finding the user by id
                    User.findById(artistId)
                        .then(result3 => {
                            if (!result3) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // removing the user from the artist's list of followers
                            let indexUid = result3.followers.indexOf(req.session.uid);
                            if(indexUid > -1){
                                result3.followers.splice(indexUid, 1);
                            }

                            // saving the updated user
                            result3.save()
                                .then(result4 => {
                                    res.status(200).send("successful");
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Error updating user.");
                                });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating user.");
                }); 
		}); 
});

// get request to the resource '/likes'
app.get("/likes", (req, res, next) => {
    // getting the id of the artwork that I need to add the like to
    let artworkId = req.query.artworkid;

    // finding the artwork by its id
    Artwork.findById(artworkId)
		.then(result => {
			if (!result) {
				res.status(404).send("Artwork ID does not exist.");
				return;
			}

            // not letting the artist add likes to their own artwork
            if(result.Artist === req.session.username){
                return;
            }

			req.artwork = result;

            // adding the uid to the artwork's array of likes
            result.Likes.push(req.session.uid);

            // saving the updated artwork
            result.save()
                .then(result2 => {
                    // finding the user by id
                    User.findById(req.session.uid)
                        .then(result3 => {
                            if (!result3) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // adding the artwork id to the user's array of likes
                            result3.likes.push(artworkId);

                            // saving the updated user
                            result3.save()
                                .then(result4 => {
                                    res.status(200).send("successful");
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Error updating user.");
                                });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating artwork.");
                });
		});
});

// checking if it is a post request to the resource '/reviews'
app.post("/reviews", (req, res, next) => {
    let data = {};
    // storing the data that was sent into data
    data = req.body;
    // getting the artwork id and the text of the review
    let artworkId = data.artworkid;
    let textValue = data.text;

    // finding the artwork by id
    Artwork.findById(artworkId)
		.then(result => {
			if (!result) {
				res.status(404).send("Artwork ID does not exist.");
				return;
			}

            // not letting the artist add reviews to their own artworks
            if(result.Artist === req.session.username){
                return;
            }

			req.artwork = result;

            let username = req.session.username;

            // creating the review object
            let review = {text: textValue, reviewer: username};

            // adding the review to the artwork's reviews array
            result.Reviews.push(review);

            // saving the updated artwork
            result.save()
                .then(result2 => {
                    // finding the user by id
                    User.findById(req.session.uid)
                        .then(result3 => {
                            if (!result3) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // adding the review to the user's reviews array
                            result3.reviews.push(review);

                            // saving the updated user
                            result3.save()
                                .then(result4 => {
                                    res.status(200).send("successful");
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Error updating user.");
                                });
                        });
                }) 
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating artwork.");
                }); 
		});
});

// checking if it is a put request to the resource '/likes'
app.put("/likes", (req, res, next) =>{
    // getting the id of the artwork that I need to remove the like from
    let artworkId = req.query.artworkid;

    // finding the artwork by id
    Artwork.findById(artworkId)
		.then(result => {
			if (!result) {
				res.status(404).send("Artwork ID does not exist.");
				return;
			}

			req.artwork = result;
			
            // removing the uid from the artwork's likes array
            let indexUid = result.Likes.indexOf(req.session.uid);
            if(indexUid > -1){
                result.Likes.splice(indexUid, 1);
            }

            // saving the updated artwork
            result.save()
                .then(result2 => {
                    // finding the user by id
                    User.findById(req.session.uid)
                        .then(result3 => {
                            if (!result3) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // removing the artwork id from the user's likes array
                            let indexAid = result3.likes.indexOf(artworkId);
                            if(indexAid > -1){
                                result3.likes.splice(indexAid, 1);
                            }

                            // saving the updated user
                            result3.save()
                                .then(result4 => {
                                    res.status(200).send("successful");
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Error updating user.");
                                });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating artwork.");
                }); 
		});
});

// checking if it is a put request to the resource '/reviews'
app.put("/reviews", (req, res, next) =>{
    // getting the id of the artwork to remove the review from 
    let artworkId = req.query.artworkid;

    // finding the artwork by id
    Artwork.findById(artworkId)
		.then(result => {
			if (!result) {
				res.status(404).send("Artwork ID does not exist.");
				return;
			}

            // removing from the artwork's reviews array
            result.Reviews.pop();

            // saving the updated artwork
            result.save()
                .then(result2 => {
                    // finding the user by id
                    User.findById(req.session.uid)
                        .then(result3 => {
                            if (!result3) {
                                res.status(404).send("User ID does not exist.");
                                return;
                            }

                            // removing from the user's reviews array
                            result3.reviews.pop();

                            // saving the updated user
                            result3.save()
                                .then(result4 => {
                                    res.status(200).send("successful");
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).send("Error updating user.");
                                });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error updating artwork.");
                }); 
		});
});

// checking if it is a put request to the resource '/account'
app.put("/account", (req, res, next) =>{
    // finding the user by id
    User.findById(req.session.uid)
        .then(result3 => {
            if (!result3) {
                res.status(404).send("User ID does not exist.");
                return;
            }

            // checking if the user's account type is patron
            if(result3.type === "patron"){
                // checking if the user has artworks
                if(result3.artworks.length == 0){
                    // redirecting to the add artwork page
                    res.redirect('/addartwork');
                }

                // checking if the user has artworks
                if(result3.artworks.length > 0){
                    // changing the user's account type to artist
                    result3.type = "artist";
                    req.session.type = "artist";

                    // saving the updated user
                    result3.save()
                        .then(result4 => {
                            res.status(200).send("successful");
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).send("Error updating user.");
                        });
                }
            }
            else{
                // changing the user's account type to patron
                result3.type = "patron";
                req.session.type = "patron";

                // saving the user
                result3.save()
                    .then(result4 => {
                        res.status(200).send("successful");
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send("Error updating user.");
                    });
            }
        });
});