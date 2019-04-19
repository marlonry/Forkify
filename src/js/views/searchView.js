import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = "";
};

export const clearResults = () => {
    elements.searchResList.innerHTML = "";
    elements.searchResPages.innerHTML = "";
}

const limitRecipeTitle = (title, limit = 17) => {
    if(title.length > limit) {
        return `${title.substring(0, limit)}...`;
    }
    return title;
}

const renderRecipes = recipe => {
    const markup = `
        <li>
            <a class="likes__link" href="#${recipe.recipe_id}">
                <figure class="likes__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="likes__data">
                    <h4 class="likes__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="likes__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;

    elements.searchResList.insertAdjacentHTML("beforeend", markup);
};

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev' ? page - 1 : page + 1}">
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);

    let button = '';
    if(page === 1 && pages > 1) {
        // only button to go to the next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // both buttons
        button = `
            ${createButton(page, 'next')}
            ${createButton(page, 'prev')}
        `;
    } else if ( page === pages && pages > 1) {
        // only button to go to previous
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    // render results
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(el => renderRecipes(el));

    // render buttons
    renderButtons(page, recipes.length, resPerPage);
};