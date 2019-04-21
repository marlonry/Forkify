import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app --> what the state object contains
 * Search object = controlSearch
 * Current recipe object = controlRecipe
 * Shopping list object
 * Liked recipes objects
 */

const state = {};


/**
 * SEARCH CONTROLLER ----------------------------------------------------------------------
 */
const controlSearch = async () => {
    // 1. get query from the view
    const query = searchView.getInput();

    if(query) {
        // 2. new search object and add to state
        state.search = new Search(query);

        // 3. prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. search for recipes
            await state.search.getResults();
            
            // 5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            console.log(state.search.result); // delete later on

        } catch(error) {
            console.log('Something went wrong with the search');
            clearLoader();
        }

    }
 }

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
 });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');

    if(btn) {
        const goToPage = parseInt(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

/**
 * RECIPE CONTROLLER ----------------------------------------------------------------------
*/

const controlRecipe = async () => {
    // Get the id from the url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // prepare ui for changes

        // create new recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data
            await state.recipe.getRecipe();
        } catch(error) {
            console.log('Error processing the recipe');
        }

        // calculate servings and time
        state.recipe.calcServings();
        // state.recipe.calcTime();
        // render recipe
        console.log(state.recipe);
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));