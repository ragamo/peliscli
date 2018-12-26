const prompts = require('prompts');

module.exports = new class Menu {

	async chooseMovie(movieList) {
		return await prompts({
		    type: 'select',
		    name: 'movie',
		    message: 'Pick a movie',
		    choices: movieList,
		    initial: 0
		});
	}

	async chooseMirror(mirrorsList) {
		return await prompts({
		    type: 'select',
		    name: 'mirror',
		    message: 'Select a mirror',
		    choices: mirrorsList,
		    initial: 0
		});
	}
}