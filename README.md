# Open-Gallery-Web-Application

Author: Fatema Lokhandwala

Program's purpose: A responsive web application to provide an exhibition space for artists to showcase their work and connect them to the community. The application supports two types of users: patrons and artists. Users can log in and logout as well as create new accounts. Users can also change between patron and artist accounts. Artist and patron users can browse and search artworks, add reviews and likes to artworks, follow artists, join workshops, and receive notifications about newly added artworks and workshops. Furthermore, artists can add new artwork or host a workshop.

List of files:
- server.js: This file contains all my server code.
- UserModel.js: This file contains the user schema.
- ArtworkModel.js: This file contains the artwork schema.
- database-initializer.js: This file contains the database initialization script which creates a new MongoDB database from the gallery.json file.
- gallery.json: This file contains a sample of artwork data which is used to initialize the database for my project.
- package.json: This file contains all the dependencies for the project.
- The public directory that contains the following files:
    - home_styles.css, header_styles.css and login_register_styles.css: These css files are used for styling my application to make it look well structured, visually appealing and responsive.
    - client.js: This file contains my client-side javascript code.
- The views directory that contains the following directories:
    - pages directory: Contains the home.pug, artwork.pug, artist.pug, user_information.pug, register.pug, login.pug, add_artwork.pug, add_workshop.pug, all_artworks.pug, search_artworks.pug, and searched_artworks.pug files.
    - partials directory: Contains the headers.pug file
- README.md: Contains this description.

Steps on how to install, initialize, and run my database and server:
- Find the package.json file and check out the dependencies.
- Open a terminal in the project's directory and run `npm install`.
- Initialize the database by typing `node database-initializer.js` in the terminal.
- Check to make sure that the database has been initialized (if you have MongoDB Compass, you can check and make sure that a database called openGallery has been created with 2 collections, artworks and users).
- Once the database has been initialized, start the server by typing `node server.js` in the terminal.
- Follow the link in the terminal to use the application or open the browser and search for http://localhost:3000/
