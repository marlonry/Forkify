import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app --> what the state object contains
 * Search object = controlSearch
 * Current recipe object = controlRecipe
 * Shopping list object
 * Liked recipes objects
 */

const state = {};

//TESTING
window.state = state;


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
            console.log(`Something went wrong with the search, ${error}`);
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
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // create new recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data and parse ingedients;
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            // render recipe
            clearLoader();
            console.log(state.recipe);
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch(error) {
            console.log(`Error processing the recipe ${error}`);
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER ----------------------------------------------------------------------
*/

const controlList = () => {
    // Create a new list if there is none yet
    if(!state.list) state.list = new List();

    // add each ingredient to the list and user interface;
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item)
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest(".shopping__item").dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from the state
        state.list.deleteItem(id);

        // delete from the UI
        listView.deleteItem(id);

        // handle the count update.
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value);
        if (val >= 0) {
            state.list.updateCount(id, val);
        } else if (e.target.value <= 0) {
            e.target.value = "0";
        }
    }
});

/**
 * LIKES CONTROLLER ----------------------------------------------------------------------
*/
// TESTING
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;

    // User has NOT yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
        );

        // toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to the UI list
        likesView.renderLike(newLike);
    // user HAS liked the current recipe
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);
        // toggle the like button
        likesView.toggleLikeBtn(false);
        // remove like from the UI list
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


// Handling recipe button clicks -----------------------------------------------------------
elements.recipe.addEventListener('click', function(e) {
    
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // if matches button decrease
        if(state.recipe.servings > 1) {
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // if matches button increase
        state.recipe.updateServings("inc")
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
})

