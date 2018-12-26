const Navigator = require('./navigator');
const Player = require('./player');
const Menu = require('./menu');

(async () => {
	
	let movies = await Navigator.fetchMovies();
	let selection = await Menu.chooseMovie(movies);

	let mirror = await Navigator.fetchMovieMirrors(selection.movie);
	console.log(mirror);

	await Player.launchPlayer(mirror.url, mirror.srt);

})();