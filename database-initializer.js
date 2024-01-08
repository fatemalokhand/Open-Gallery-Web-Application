// requiring the necessary modules
const mongoose = require("mongoose");
const Artwork = require("./ArtworkModel");
const User = require("./UserModel");

// requiring the gallery.json file
let data = require("./gallery.json");

// an array that contains all the artworks
let allArtworks = [["Air meets Water"], ["Kaleidoscope eye"], ["Independence Monument"], ["Dancing in the street"], ["Hearts and a Watercolor"], ["Untitled (O'Ryan)"], ["Courage My Love"], ["Mona Lisa"], ["Girl with a Pearl Earring"], ["Paris Street; Rainy Day"], ["Maman"], ["The Thinker"], ["Cloud Gate"], ["Wanderer above the Sea of Fog"], ["Las Meninas"], ["Composition with Red, Blue and Yellow"], ["Water Lilies"], ["Hedgehog"], ["Rhapsody"], ["Tiny bunny love"], ["The Starry Night", "Sunflowers"], ["Girl with Balloon", "Flower Thrower", "Kissing Coppers", "Show Me the Monet", "Gorilla in a Pink Mask", "The Gymnast", "The Judo Competition", "Kids Playing", "Devolved Parliament", "Love is in the Bin", "Game Changer"]];

// creating and saving the artworks
let artworkList = [];
for (let i = 0; i < data.length; i++) {
	let a = new Artwork();
	a.Title = data[i].Title;
	a.Artist = data[i].Artist;
	a.Year = data[i].Year;
    a.Category = data[i].Category;
    a.Medium = data[i].Medium;
    a.Description = data[i].Description;
    a.Poster = data[i].Poster;
	a.Reviews = [];
	a.Likes = [];
	artworkList.push(a);
}

// creating and saving the users
let numUsers = 22;
let userList = []
for (let i = 0; i < numUsers; i++) {
	let u = new User();
	u.username = data[i].Artist;
	u.password = data[i].Artist.replace(/\s/g, '') + "123";
	u.type = "artist";
	u.reviews = [];
	u.likes = [];
	u.artworks = allArtworks[i];
	u.workshops = [];
	u.notifications = [];
	u.followers = [];
	u.following = [];
	userList.push(u);
}

// connecting to the openGallery database
mongoose.connect('mongodb://127.0.0.1:27017/openGallery');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {

	await mongoose.connection.dropDatabase()
	console.log("Dropped database. Starting re-creation.");

	// saving each artwork that is in the artworkList 
	let completedArtworks = 0;
	artworkList.forEach(artwork => {
		artwork.save()
			.then(result => {
				completedArtworks++;
				if (completedArtworks >= artworkList.length) {
					console.log("All artworks saved.");
				}
			})
			.catch(err => {
				throw err;
			})
	});

	// saving each user that is in the userList
	let completedUsers = 0;
	userList.forEach(user => {
		user.save()
			.then(result => {
				completedUsers++;
				if (completedUsers >= userList.length) {
					console.log("All users saved.");
				}
			})
			.catch(err => {
				throw err;
			})
	});
});