
const storage = document.querySelector('#storage');
const output = document.querySelector('.output')
const objects = document.querySelector('.objects')

storage.addEventListener('change', getStorageData)
document.addEventListener('click', clickHandler)

// обработчик события click
function clickHandler(event) {
    const target = event.target;

    if(target.closest('.search')) {
        let obj = JSON.parse(localStorage.getItem('data'))
        let selectedValues = [...document.querySelectorAll('.checkbox')]
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value)

        let objs = getObjects(obj, selectedValues)
        renderObjects(objs)
    }
}

// получение данных из файла data.json
function getStorageData(event) {
    let input = event.target;
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function() {
        localStorage.setItem('data', reader.result)

        let result = JSON.parse(reader.result);
        let allParams = getAllParameters(result);
        render(allParams);
    }
}

// Получение всех уникальных параметров, которые есть у объектов
function getAllParameters(obj) {
    let result = [];
    _.mapKeys(obj, function(item) {
        let keys = _.keys(item)
        keys.forEach((item) => {
            if(!result.includes(item)) result.push(item)
        })
    });

    return result;
}

// Получение объектов, в которых присутствуют выбранные свойства
function getObjects(obj, params) {
    let result = [];
    _.mapKeys(obj, function(item) {
        let objKeys = _.keys(item)
        let intersection = params.filter(x => objKeys.includes(x))

        if(intersection.length) result.push(item)
        item['intersection'] = intersection.length

        intersection.forEach(item => {
            let res = []
            for(let prop in obj) {
                let current = obj[prop]
                if(current[item]) res.push(current[item])

                if(res.length >= 2) {
                    current[`${item}_min`] = getMinOfArray(res)
                    current[`${item}_max`] = getMaxOfArray(res)
                }
            }
        })
    })

    // сортировка по количеству найденных свойств
    return result.sort((a, b) => a.intersection < b.intersection ? 1 : -1)
        .filter(item => delete item.intersection);
}

// Вывод на страницу списка всех доступных свойств, каждое свойство - обдельных checkbox
function render(data) {
    let html = data.map(item => `<div><input type="checkbox" class="checkbox" value="${item}" id="${item}"></input><label for="${item}">${item}</label></div>`).join('');
    output.innerHTML = `${html}<button class="search">Найти</button>`;
}

// Вывод на страницу всех найденных объектов
function renderObjects(objs) {
    let html = ``
    objs.forEach(item => {
        html += `<ul>`
        for(const [key, value] of Object.entries(item)) {
            if(key.includes('max') || key.includes('min')) html += `<li>-----</li>`
                html += `<li>${key}: ${value}</li>`
        }
        html += `</ul>`
    })

    objects.innerHTML = `
        <p>Найденые объекты:</p>
        ${html}
    `
}

// Получение максимального числа в массиве
function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}

// Получение минимального числа в массиве
function getMinOfArray(numArray) {
    return Math.min.apply(null, numArray);
}