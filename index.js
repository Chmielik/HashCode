const fs = require('fs')
const createInterface = require('readline').createInterface
const createReadStream = fs.createReadStream

const files = ['a_example', 'e_shiny_selfies', 'b_lovely_landscapes', 'c_memorable_moments', 'd_pet_pictures']

const file = files[process.argv.length > 2 ? parseInt(process.argv[2]) : 3]

const lineReader = createInterface({
  input: createReadStream('input/' + file + '.txt')
})

class Slide {
  constructor(photoIndexes) {
    this.photoIndexes = photoIndexes
  }
}

class SlideShow {
  constructor() {
    this.photosCount = 0
    this.slides = []
  }
}

const slideshow = new SlideShow()

let count = 0

function readDescLine(line) {
  const values = line.split(' ')
  slideshow.photosCount = parseInt(values[0], 10)
}

const photos = []

class Photo {
  constructor(tags, tagsLength, index, landscape) {
    this.tags = tags
    this.landscape = landscape
    this.tagsLength = tagsLength
    this.index = index
  }
}

function readPhotoLine(line, index) {
  const splitted = line.split(' ')
  const tags = splitted.slice(2)
  photos.push(new Photo(tags, tags.length, index - 1, splitted[0]))
}

function start() {
  let verticalPhotos = []

  photos.forEach((photo, index) => {
    let slide

    if (photo.landscape === 'V') {
      verticalPhotos.push(photo.index)
    } else {
      slide = new Slide([photo.index])
      slideshow.slides.push(slide)
    }
    if (verticalPhotos.length === 2) {
      slide = new Slide([...verticalPhotos])
      slideshow.slides.push(slide)
      verticalPhotos = []
    }
  })

  points()
  write()
}

function points() {
  let sumPoints = 0
  slideshow.slides.forEach((slide, index) => {
    let tags
    if (slide.photoIndexes.length > 1) {
      tags = arrayUnique([...photos[slide.photoIndexes[0]].tags, ...photos[slide.photoIndexes[1]].tags])
    } else {
      tags = photos[slide.photoIndexes[0]].tags
    }
    const nextSlide = slideshow.slides[index + 1]
    let nextSlideTags
    if (nextSlide) {
      let nextTags
      if (nextSlide.photoIndexes.length > 1) {
        nextTags = arrayUnique([...photos[nextSlide.photoIndexes[0]].tags, ...photos[nextSlide.photoIndexes[1]].tags])
      } else {
        nextTags = photos[slide.photoIndexes[0]].tags
      }
      nextSlideTags = nextTags
    }
    const points = calculatePoints(tags, nextSlideTags)
    sumPoints = sumPoints + points
  })
  console.log('points', sumPoints)
}

function calculatePoints(tags1, tags2) {
  if (!tags1 || !tags2) return 0
  let foundTags = []
  tags1.forEach(tag => {
    const foundTagIndex = tags2.findIndex(t => {
      return t === tag
    })
    if (foundTagIndex >= 0) {
      tags2.splice(foundTagIndex, 1)
      foundTags.push(tag)
    }
  })

  tags2.forEach(tag => {
    const foundTagIndex = tags1.findIndex(t => t === tag)
    if (foundTagIndex >= 0) {
      tags1.splice(foundTagIndex, 1)
      foundTags.push(tag)
    }
  })
  return Math.min(tags1.length, tags2.length, foundTags.length)
}

function write() {
  let out = `${slideshow.photosCount}`
  // const data = []
  // data.push(out)
  // slideshow.slides.forEach(slide => {
  //   data.push(slide.photoIndexes.join(' '))
  // })

  slideshow.slides.forEach(slide => {
    out = `${out}
${slide.photoIndexes.join(' ')}`;
  });
console.log(out)
  fs.writeFile(`out/${file}.txt`, out, () => {})
}

lineReader.on('line', function(line) {
  if (count === 0) readDescLine(line) // zmienne
  else readPhotoLine(line, count)
  count++
  if (count === 1 + slideshow.photosCount) start()
})

function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }
  return a;
}