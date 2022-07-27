const toggleBtns = document.querySelectorAll('.toggle-sidebar')
const loadmoreBtn = document.querySelector('#loadmore')

const sidebarLarge = document.querySelector('.sidebar-lg')
const sidebarSmall = document.querySelector('.sidebar-sm')
const mainContent = document.querySelector('.main')
const overlayBg = document.querySelector('.overlay-bg')

const api = {
  baseUrl: 'https://api.themoviedb.org/3/',
  apiKey: '8151a26f17888f9d09496420f570361d',
  originalImage: (imgPath) => `https://image.tmdb.org/t/p/original/${imgPath}`,
  w500Image: (imgPath) => `https://image.tmdb.org/t/p/w500/${imgPath}`,
}

let page = 1
let searchPage = 1
let totalPage = 0
let totalSearchPage = 0

let data = []
let dataSearch = []
let currentIndexGenre = 0

function start() {
  const params = {
    page: page,
    language: 'vi-VN',
  }

  const params_s = {
    page: searchPage,
    language: 'vi-VN',
  }

  const id = new URLSearchParams(location.search).get('id')
  const query = new URLSearchParams(location.search).get('search')

  getMoviesList(renderMoviesList, params)
  id && getVideos(renderVideo, id, params)
  id && getSimilarVideos(renderSimilarVideos, id, params)
  query && getMoviesSearch(renderMoviesSearch, query, params_s)
  getGenreList(renderGenreList, params)
  id && getDetail(id, params)
  id && getCredits(id, params)

  handleEvent()
}

start()

function handleEvent() {
  const searchLoadMoreBtn = document.querySelector('#search-loadmore')

  toggleBtns &&
    toggleBtns.forEach((item) => item.addEventListener('click', ToggleSidebar))
  loadmoreBtn && loadmoreBtn.addEventListener('click', loadMore)
  document.addEventListener('keydown', enterEvent)
  searchLoadMoreBtn &&
    searchLoadMoreBtn.addEventListener('click', searchLoadMore)
}

function getMoviesList(callback, params) {
  const genre = 'movie/popular'
  axios
    .get(api.baseUrl + genre + '?api_key=' + api.apiKey, { params })
    .then(function (response) {
      data = [...data, ...response.data.results]
      totalPage = response.data.total_pages
      return data
    })
    .then(callback)
}

function getVideos(callback, id, params) {
  axios
    .get(api.baseUrl + `movie/${id}/videos?api_key=` + api.apiKey, { params })
    .then(function (response) {
      return response.data.results
    })
    .then(callback)
}

async function getDetail(id, params) {
  await axios
    .get(api.baseUrl + `movie/${id}?api_key=` + api.apiKey, { params })
    .then((response) => {
      return response.data
    })
    .then(renderDetail)
}

async function getCredits(id, params) {
  await axios
    .get(api.baseUrl + `movie/${id}/credits?api_key=` + api.apiKey, { params })
    .then((response) => {
      console.log(response.data.cast)
      return response.data.cast
    })
    .then(renderCredits)
}

async function getSimilarVideos(callback, id, params) {
  await axios
    .get(api.baseUrl + `movie/${id}/similar?api_key=` + api.apiKey, { params })
    .then(function (response) {
      return response.data.results
    })
    .then(callback)
}

async function getMoviesSearch(callback, query, params) {
  await axios
    .get(
      api.baseUrl + 'search/movie?api_key=' + api.apiKey + '&query=' + query,
      { params },
    )
    .then(function (response) {
      dataSearch = [...dataSearch, ...response.data.results]
      totalSearchPage = response.data.total_pages
      return dataSearch
    })
    .then(callback)
}

async function getGenreList(callback, params) {
  await axios
    .get(api.baseUrl + 'genre/movie/list?api_key=' + api.apiKey, { params })
    .then(function (response) {
      return response.data.genres
    })
    .then(callback)
}

function renderMoviesList(movies) {
  const movieList = document.getElementById('list-movies')
  const mvItemTemplate = document.getElementById('movie-item-template')
  movieList.innerHTML = ''

  movies.forEach((movie) => {
    const div = mvItemTemplate.content.cloneNode(true)
    div.getElementById('movie-path').href = `detail.html?id=${movie.id}`
    div.getElementById('movie-img').src = api.w500Image(
      movie.backdrop_path || movie.poster_path,
    )
    div.getElementById('info-img').src = 'assets/imgs/channel_1.jpg'
    div.getElementById('info-title').textContent = movie.title
    div.getElementById(
      'info-details',
    ).innerHTML = `<p class="text-sm" >Bình chọn: ${movie.vote_average}</p>
    <p class="release-date text-sm">Ngày phát hành: ${movie.release_date}</p>`
    movieList.append(div)
  })
}

function renderVideo(videos) {
  const videoContainer = document.querySelector('#video-container')
  const mainVideo = document.querySelector('#main-video')
  const titleVideo = videoContainer.querySelector('.title')
  const publishedAt = videoContainer.querySelector('.published-at')

  let i = 0
  let video = videos[i]
  mainVideo.src = 'https://www.youtube.com/embed/' + video.key
  titleVideo.textContent = video.name
  publishedAt.textContent = video.published_at
}

function renderDetail(item) {
  const videoDes = document.getElementById('video-description')
  const channelName = videoDes.querySelector('#channel_name')
  const description = videoDes.querySelector('.des')

  channelName.textContent = 'F8 Official'
  description.textContent = item.overview
}

function renderCredits(casts) {
  const htmls = casts.map(
    (cast) =>
      `<div class="cast">
    <img
      src=${
        (cast.profile_path && api.w500Image(cast.profile_path)) ||
        'assets/imgs/user_default.jpg'
      }
      class="img-cast"
      alt=""
    />
    <p class="name-cast">${cast.name}</p>
    <p class="text-sm">Nhân vật: ${cast.character}</p>
  </div>`,
  )

  document.getElementById('cast-list').innerHTML = htmls.join('')
}

function renderSimilarVideos(videos) {
  const relatedVideos = document.querySelector('#related-videos')
  const img_default = './assets/imgs/video_1.jpg'

  const similarVideos = videos.map((item, i) => {
    const image =
      item.backdrop_path || item.poster_path
        ? api.w500Image(item.backdrop_path || item.poster_path)
        : img_default
    return `<div class="related-video-item">
    <a href="./detail.html?id=${item.id}">
      <div class="d-flex">
        <img src="${image}" alt="" />
        <div class="related-video-item--info">
          <h3 class="title">
            ${item.title}
          </h3>
          <p class="text-sm">Bình chọn: ${item.vote_average}</p>
          <p class="text-sm">${item.release_date}</p>
        </div>
      </div>
    </a>
  </div>`
  })

  relatedVideos.innerHTML = similarVideos.join('')
}

function renderMoviesSearch(videos) {
  const resultsVideo = document.querySelector('#results-video')
  const img_default = './assets/imgs/video_1.jpg'

  const videoItem = videos.map((item, i) => {
    const image = item.poster_path
      ? api.w500Image(item.backdrop_path || item.poster_path)
      : img_default
    return `<div class="video-item">
    <a href="./detail.html?id=${item.id}">
      <div class="d-flex justify-center">
        <div class="video-poster">
          <img src="${image}" alt="" />
        </div>
        <div class="video-info">
          <h3 class="title">
            ${item.title}
          </h3>
          <p class="text-sm">${item.release_date}</p>
          <p class="text-sm">Bình chọn: ${item.vote_average}</p>
          <div class="des text-sm truncate">
            ${item.overview}
          </div>
        </div>
      </div>
    </a>
  </div>`
  })

  resultsVideo.innerHTML = videoItem.join('')
}

function renderGenreList(genres) {
  const genresEle = document.getElementById('genres')
  let currentIndex = 0

  const genre = genres.map((genre, i) => {
    return `<li class="genre ${
      i === currentIndex ? 'active' : ''
    }" data-index = ${genre.id}>${genre.name}</li>`
  })
  genresEle.innerHTML = genre.join('')
}

function ToggleSidebar() {
  sidebarLarge && sidebarLarge.classList.toggle('active')
  sidebarSmall && sidebarSmall.classList.toggle('active')
  mainContent && mainContent.classList.toggle('expanded')
  overlayBg && overlayBg.classList.toggle('show')

  setTimeout(function () {
    sidebarLarge.classList.remove('slide-in')
    sidebarLarge.classList.contains('active') &&
      sidebarLarge.classList.add('slide-in')
  }, 2)
}

function loadMore() {
  if (page < totalPage) {
    page += 1
    const params = {
      page: page,
      language: 'vi-VN',
    }
    getMoviesList(renderMoviesList, params)
  }
}

function searchLoadMore() {
  if (searchPage < totalSearchPage) {
    searchPage += 1
    const params = {
      page: searchPage,
      language: 'vi-VN',
    }
    const query = new URLSearchParams(location.search).get('search')
    getMoviesSearch(renderMoviesSearch, query, params)
  }
}

function search() {
  const searchInput = document.querySelector('#search-input')
  searchInput.onchange = (e) => {
    const query = e.target.value
    window.location.href = `search.html?search=${query}`
  }
}

function enterEvent(e) {
  if (e.keyCode === 13) {
    search()
  }
}
