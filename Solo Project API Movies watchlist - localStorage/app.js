// All Elements i want to use -----------------

const myApp = document.getElementById("app")
const searchBtn = document.getElementById("btn")
const lightBtn = document.getElementById("light-toggle")
const nextBtn = document.getElementById("next")

const searchResults = document.querySelector(".search-results")
const subtitleFront = document.querySelector(".subtitle-front")
const subtitleBack = document.querySelector(".subtitle-back")
const main = document.querySelector(".main")
const mainBack = document.querySelector(".main-back")
const myWatchlist = document.querySelector(".my-watchlist")
const searchInput = document.querySelector(".movie-search")

const descs = document.querySelectorAll(".desc")

let pageNumber = 1
let moviesArray = []
let watchListArray = []

const savedMovies = JSON.parse(localStorage.getItem("savedList"))
if (savedMovies) {
  watchListArray = savedMovies
}

render(moviesArray, searchResults)
render(watchListArray, myWatchlist)

// Light & Dark Mode Switch -------------------

function switchMode() {
  main.classList.toggle("light")
  mainBack.classList.toggle("light")
  myApp.classList.toggle("light")

  descs.forEach((desc) => desc.classList.toggle("light"))
}

lightBtn.addEventListener("click", switchMode)

// Swith from Search page to Watchlist page ---------------------

subtitleFront.addEventListener("click", flipThePage)
subtitleBack.addEventListener("click", flipThePage)

function flipThePage() {
  myApp.classList.toggle("clicked")

  if (myApp.classList.contains("clicked")) {
    mainBack.classList.remove("hide")

    setTimeout(() => {
      main.classList.add("hide")
    }, 1000)
  } else {
    main.classList.remove("hide")

    setTimeout(() => {
      mainBack.classList.add("hide")
    }, 1000)
  }
}

// Fetch the movies from the API --------------------
// API Site = http://www.omdbapi.com/?apikey=16f80093&

async function fetchTheMovies(name, page) {
  // First fetch list of movies from search
  const responce = await fetch(
    `https://www.omdbapi.com/?apikey=16f80093&s=${name}&page=${page}`
  )
  const data = await responce.json()

  // Check response if true or false and render
  if (data.Response === "True") {
    // Get the ids from the data i fetched
    const ids = data.Search.map((item) => item.imdbID)

    // Use the ids to fetch the movies from imdbID
    const promises = ids.map(async (id) => {
      const responce = await fetch(
        `https://www.omdbapi.com/?apikey=16f80093&i=${id}`
      )
      const data = await responce.json()
      return data
    })

    // Re-asign movies array after all promises finish
    moviesArray = await Promise.all(promises)

    // Scroll page to top and Render
    document.documentElement.scrollTop = 0
    render(moviesArray, searchResults)
  } else if (data.Response === "False") {
    nextBtn.classList.remove("show-next")
    searchResults.innerHTML = `<p class="error">${data.Error}</p>`
  }
}

searchBtn.addEventListener("click", function () {
  pageNumber = 1
  fetchTheMovies(searchInput.value, pageNumber)
})

nextBtn.addEventListener("click", function () {
  pageNumber++
  fetchTheMovies(searchInput.value, pageNumber)
})

// Create the Movies elements -------------

function createMovie(arrayData) {
  return arrayData
    .map((item) => {
      return `
    <div class="movie flex">
      <div class="poster">
        <img class="poster-img" 
          src="${item.Poster}" 
          alt="Movie Poster" >
      </div>

      <div class="details flex">
          
          <div class="name flex">
              <h5 
                class="movie-name">
                ${item.Title}</h5>
              <i class="fa-solid fa-star star"></i>
              <p class="rating">${item.imdbRating}</p>
          </div>

          <div class="more flex">
            <p class="run-time">${item.Runtime}</p>
            <p class="chategory">${item.Genre}</p>
            <button class="add">
              <i
              data-add-btn="${item.imdbID}"
              class="fa-solid ${
                watchListArray.some((el) => el.imdbID === item.imdbID)
                  ? "fa-minus"
                  : "fa-plus"
              }
                plus"></i>
            </button>
            <p 
            data-add-btn="${item.imdbID}"
            data-text="${item.imdbID}"
            class="add-to-watchlist">
              ${
                watchListArray.some((el) => el.imdbID === item.imdbID)
                  ? "Remove"
                  : "Watchlist"
              }
            </p>
          </div>
          <p class="desc">
            ${item.Plot}
          </p>
      </div>
    </div>
  `
    })
    .join("<hr>")
}

// Render Each array in its Element or Page -----------

function render(arrayData, element) {
  let emptyHtml = ``

  if (createMovie(arrayData) && element === searchResults) {
    emptyHtml = createMovie(arrayData)

    setTimeout(() => {
      nextBtn.classList.add("show-next")
    }, 1000)
  } else if (createMovie(arrayData) && element === myWatchlist) {
    emptyHtml = createMovie(arrayData)
  } else if (!createMovie(arrayData) && element === searchResults) {
    emptyHtml = `
    <div class="empty-search flex">
      <img src="img/Icon.png">
      <p>Start exploring</p>
    </div>
    `
    nextBtn.classList.remove("show-next")
  } else if (!createMovie(arrayData) && element === myWatchlist) {
    emptyHtml = `
    <div class="empty-search flex"> 
      <p>Your watchlist is looking a little empty...</p>
      <p>Let's add some movies!</p>
    </div>
    `
    nextBtn.classList.remove("show-next")
  }

  element.innerHTML = emptyHtml
}

// Click Add icon or "Watchlist" text functionality ----------

document.addEventListener("click", function (e) {
  if (e.target.dataset.addBtn) {
    addAndRemove(e.target.dataset.addBtn)
  }
})

// Add the clicked Movie to Watchlist Array ------------

function addAndRemove(movieID) {
  // Get the element with the data-attribute

  const element = document.querySelector(`[data-add-btn="${movieID}"]`)
  const textElement = document.querySelector(`[data-text="${movieID}"]`)

  // Find the movie
  const myMovie = moviesArray.filter((movie) => {
    return movie.imdbID === movieID
  })[0]

  if (element.classList.contains("fa-plus")) {
    // Only Add the movie to watch list if it doesnt exists there
    if (!watchListArray.some((item) => item.imdbID === movieID)) {
      watchListArray.unshift(myMovie)
    }

    // Change text to "Remove"
    textElement.textContent = "Remove"
  } else if (element.classList.contains("fa-minus")) {
    watchListArray = watchListArray.filter((movie) => {
      return movie.imdbID !== movieID
    })

    textElement.textContent = "Watchlist"
  }

  element.classList.toggle("fa-plus")
  element.classList.toggle("fa-minus")
  console.log(watchListArray)

  localStorage.setItem("savedList", JSON.stringify(watchListArray))
  render(watchListArray, myWatchlist)
}
