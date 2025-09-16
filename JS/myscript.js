"use strict";
(function() {
    document.addEventListener("DOMContentLoaded", function(){

        const API_KEY = "Your API key";
        const API_URL = `https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${API_KEY}`;
        const infoAboutRovers = {};
        const loading = document.getElementById('loading');
        const dateFormatError = document.getElementById('dateFormatError');
        const earthError = document.getElementById('earthError');
        const marsError = document.getElementById('marsError');
        const roverError = document.getElementById('RoverError');
        const cameraError = document.getElementById("cameraError");
        const savedPhotos = new Map();
        let carouselInterval;

        /**
         * this function creates  HTML elements.
         * it's a void function
         * this function does not receive or return anything.
         */
        function createHTML(){
            const ResultsDiv = document.getElementById('SearchResults');
            const searchDiv = document.getElementById('searchDiv');
            const Restext = document.createElement('h2');
            const SearchImages = document.createElement('h2');
            const selectInfo = document.createElement('h6');

            Restext.classList.add('text-primary-emphasis');
            Restext.innerHTML = 'Search results:';
            ResultsDiv.appendChild(Restext);

            SearchImages.classList.add('text-primary-emphasis');
            SearchImages.innerHTML = 'Search for Mars Images';

            selectInfo.classList.add('text-primary-emphasis');
            selectInfo.innerHTML = 'Please select your preferred rover with your preferred camera and date format' +
                ' ,once you search save your preferred images and then you can start a carousel. You can view ' +
                'the carousel by clicking on the Saved Images button, there click on Start Carousel button Enjoy :)'  ;

            searchDiv.appendChild(SearchImages);
            searchDiv.appendChild(selectInfo);

        }
        /**
         * this function handles the displaying and hiding of the loading Gif.
         * this function receives a boolean parameter display, if display was true the loading gif will be displayed
         * otherwise the loading gif will not be displayed
         * it's a void function
         * this function does not return anything
         * @param display
         */
        function loadingGif(display){

            if(display){
                //display the loading Gif
                loading.classList.remove('d-none');
            }
            else{
                //hide the loading Gif
                loading.classList.add('d-none');
            }

        }

        /**
         * this function creates the dropdown for the rovers
         * it's a void function
         * this function does not receive or return anything
         */
        function roverDropdown(){
            const roverSelect = document.getElementById('Rover');

            for(const rover in infoAboutRovers){

                //create the rover option
                const option = document.createElement('option');
                option.value = rover;
                option.textContent = infoAboutRovers[rover].name;
                roverSelect.appendChild(option);
            }

            getCameras().then();
        }

        /**
         * this function creates the label and select elements for the rover
         * it's a void function
         * this function does not receive or return anything
         */
        function createRoverField(){
            const roverDefinition = document.getElementById('roverField');
            const roverLabel = document.createElement('label');
            const roverSelect = document.createElement('select');
            const defaultOption = document.createElement('option');
            roverDefinition.innerHTML = '';

            //define the rover label
            roverLabel.textContent = 'Select a rover';
            roverLabel.htmlFor = 'Rover';
            roverLabel.classList.add('form-label');

            //define the rover select
            roverSelect.id = 'Rover';
            roverSelect.classList.add('form-select');


            roverDefinition.appendChild(roverLabel);
            roverDefinition.appendChild(roverSelect);

            //add a default option for the rover option
            defaultOption.textContent = 'Select a rover';
            defaultOption.setAttribute('hidden', String(true));
            defaultOption.setAttribute('disabled', String(true));
            defaultOption.setAttribute('selected', String(true));
            defaultOption.setAttribute('value', '');
            roverSelect.appendChild(defaultOption);
        }
        /**
         * this function fetches the rovers from the NASA api and calls for a function to create a dropdown with fetched rover info
         *this function returns a promise (it's an async function)
         * this function does not receive anything
         * @returns {Promise<void>}
         */
        async function getRoversInfo(){

            try{
                //display loading gif when fetching data from api
                loadingGif(true);

                const response = await fetch(API_URL);

                //if there is a problem display an error
                if (response.status !== 200) {
                    document.querySelector("#ErrorStatus").innerHTML = 'NASA server is not available right now,' +
                        ' please try again later. Status Code: ' + response.status;
                    return;
                }

                //wait for the response
                const data = await response.json();


                //save the fetched info inside an object called infoAboutRovers
                //so that we don't have to fetch the info every time from the NASA API
                data.rovers.forEach(rover => {

                    infoAboutRovers[rover.name.toLowerCase()] = {
                        name: rover.name,
                        landingDate: rover.landing_date,
                        maxDate: rover.max_date,
                        maxSol: rover.max_sol,
                        Cameras: rover.cameras.map(camera => ({
                            shortName: camera.name,
                            fullName: camera.full_name
                        }))
                    };

                });

                //call for the function that creates the dropdown for the rovers
                roverDropdown();

                //hide loading gif after finishing fetching the data from api
                loadingGif(false);
            }
            catch(error){
                console.error('Error fetching rovers', error);
            }
        }

        /**
         * this function creates the cameras field (label and select)
         * it's a void function
         * this function does not return or receive anything
         */
        function createCamerasField(){
            const camerasDefinition = document.getElementById('camerasField');
            const camerasLabel = document.createElement('label');
            const camerasSelect = document.createElement('select');
            camerasDefinition.innerHTML = '';

            //define the cameras label
            camerasLabel.textContent = 'Select a rover first then select a camera';
            camerasLabel.htmlFor = 'Cameras';
            camerasLabel.classList.add('form-label');

            //define the cameras select
            camerasSelect.id = 'Cameras';
            camerasSelect.classList.add('form-select');

            camerasDefinition.appendChild(camerasLabel);
            camerasDefinition.appendChild(camerasSelect);

        }

        /**
         * this function gets the info of the cameras from an object that stores info about the rovers
         * and creates the dropdown for the cameras(with cameras names)
         * this function return a promise (it's an async function)
         * @returns {Promise<void>}
         */
        async function getCameras(){
            const roverSelect = document.getElementById('Rover');
            const cameraSelect = document.getElementById('Cameras');
            roverError.innerHTML = '';
            cameraSelect.innerHTML = "";

            //get the info from the info object
            const roverInfo = infoAboutRovers[roverSelect.value];
            if(roverInfo && roverInfo.Cameras){
                let Cameras = roverInfo.Cameras;

                // Add a default disabled option
                const defaultCameraOption = document.createElement('option');
                defaultCameraOption.textContent = 'Select a camera';
                defaultCameraOption.setAttribute('disabled', true);
                defaultCameraOption.setAttribute('selected', true);
                defaultCameraOption.setAttribute('value', '');
                cameraSelect.appendChild(defaultCameraOption);

                //create options with the cameras names
                Cameras.forEach(camera => {
                    const option = document.createElement('option');
                    option.value = camera.shortName;
                    option.textContent = camera.fullName;
                    cameraSelect.appendChild(option);
                });

                cameraSelect.addEventListener('change', () => {
                    if (cameraSelect.value !== '') {
                        cameraError.innerHTML = '';
                    }
                });
            }

        }

        /**
         * this function creates the date format dropdown and the date format select and label
         * it's a void function
         * this function does not return or receive anything
         */
        function createDateFormat(){
            const dateFormatDiv = document.getElementById('dateFormatField');
            const dateFormatLabel = document.createElement('label');
            const dateFormatSelect = document.createElement('select');
            const options = [{text: 'Earth Date', value: 'earthDate'},
                {text: 'Mars Date (Sol)', value: 'solDate'}];
            const defaultOption = document.createElement('option');

            //define the date format label
            dateFormatLabel.htmlFor = 'dateFormat';
            dateFormatLabel.classList.add('form-label');
            dateFormatLabel.textContent = 'Select date format';

            //define the date format select
            dateFormatSelect.id = 'dateFormat';
            dateFormatSelect.classList.add('form-select');

            //create a default option for the date format dropdown
            defaultOption.textContent = 'Select a date format';
            defaultOption.setAttribute('hidden', String(true));
            defaultOption.setAttribute('disabled', String(true));
            defaultOption.setAttribute('selected', String(true));
            defaultOption.setAttribute('value', '');
            dateFormatSelect.appendChild(defaultOption);

            //create the options for the date format dropdown
            options.forEach(function (optionData){
                const dateFormatOption = document.createElement('option');
                dateFormatOption.textContent = optionData.text;
                dateFormatOption.value = optionData.value;
                dateFormatSelect.appendChild(dateFormatOption);
            });

            dateFormatDiv.appendChild(dateFormatLabel);
            dateFormatDiv.appendChild(dateFormatSelect);

        }

        /**
         * this function creates the date input fields (earth date, sol date)
         * it creates the input and label element for both
         * it's a void function
         * this function does not receive or return anything
         */
        function createDateFields(){

            const dateFormat = document.getElementById('dateFormat');
            const selectedFormat = dateFormat.value;
            const earthDateFieldDiv = document.getElementById('earthDateField');
            const marsDateFieldDiv = document.getElementById('marsDateField');

            earthDateFieldDiv.innerHTML = '';
            marsDateFieldDiv.innerHTML = '';

            if(selectedFormat === 'earthDate')
            {
                earthDateFieldDiv.classList.remove('d-none');
                marsDateFieldDiv.classList.add('d-none');

                marsError.innerHTML = "";
                dateFormatError.innerHTML = "";

                //define the label for the earth date
                const earthDateLabel = document.createElement('label');
                earthDateLabel.textContent = 'Enter earth date';
                earthDateLabel.htmlFor = 'Earth';
                earthDateLabel.classList.add('form-label');

                //define the input for the earth date
                const earthDateInput = document.createElement('input');
                earthDateInput.id = 'Earth';
                earthDateInput.type = 'date';
                earthDateInput.classList.add('form-control', 'mb-3');
                earthDateInput.placeholder = 'Enter earth date';

                earthDateFieldDiv.appendChild(earthDateLabel);
                earthDateFieldDiv.appendChild(earthDateInput);
            }

            else if(selectedFormat === 'solDate'){
                earthDateFieldDiv.classList.add('d-none');
                marsDateFieldDiv.classList.remove('d-none');

                earthError.innerHTML = "";
                dateFormatError.innerHTML = "";

                //define the label for the sol date
                const marsDateLabel = document.createElement('label');
                marsDateLabel.textContent = 'Enter sol';
                marsDateLabel.htmlFor = 'Sol';
                marsDateLabel.classList.add('form-label');

                //define the input for the sol date
                const marsDateInput = document.createElement('input');
                marsDateInput.id = 'Sol';
                marsDateInput.type = 'number';
                marsDateInput.classList.add('form-control', 'mb-3');

                marsDateFieldDiv.appendChild(marsDateLabel);
                marsDateFieldDiv.appendChild(marsDateInput);

            }
        }

        /**
         * this function which will be called once the submit button is clicked
         * this function validates the input fields and fetches info from the NASA API based on the entered info from the user
         * it returns a promise (it's an async function)
         * it prevents the default action of the submit button
         */
        document.getElementById('submitBtn').addEventListener('click', async function(event){
            event.preventDefault();


            const dateFormat = document.getElementById('dateFormat').value;
            const earthDate = document.getElementById('Earth');
            const marsDate = document.getElementById('Sol');
            const Rover = document.getElementById('Rover').value;
            const Cameras = document.getElementById('Cameras').value;
            let dateInput = '';
            let URL;
            let Valid = true;


            //save the earth date info that the user entered inside dateInput
            if(dateFormat === 'earthDate'){
                dateInput  = document.getElementById('Earth').value;
            }

            //save the sol date info that the user entered inside dateInput
            if(dateFormat === 'solDate'){
                dateInput  = document.getElementById('Sol').value;
            }

            //if the rover field is empty, display an error
            if (Rover === "") {
                roverError.innerHTML = "Select a rover please";
                Valid = false;

            }
            else{
                roverError.innerHTML = "";
            }

            //if the date format field is empty, display an error
            if(dateFormat === ""){
                dateFormatError.innerHTML = "Select a date format please";
                Valid = false;
            }
            else{
                dateFormatError.innerHTML = "";
            }


            //if the user selected the earth date field, check if its empty, if so display an error
            if (dateFormat === 'earthDate'){
                dateFormatError.innerHTML = '';
                if (earthDate.value === "") {
                    earthError.innerHTML = "Enter an earth date please";
                    Valid = false;
                }

                else if(dateInput < infoAboutRovers[Rover].landingDate || dateInput > infoAboutRovers[Rover].maxDate){
                    earthError.innerHTML = `The starting earth date is 
                    ${infoAboutRovers[Rover].landingDate} and the maximum earth date is ${infoAboutRovers[Rover].maxDate} `;
                    Valid = false;
                }

                else {
                    earthError.innerHTML = "";
                }
            }


            //if the user selected the sol date field, check if its empty, if so display an error
            if(dateFormat === 'solDate'){
                dateFormatError.innerHTML = '';
                if( marsDate.value === ""){
                    marsError.innerHTML = "Enter a sol date please";
                    Valid = false;
                }

                else if(dateInput < 0 || dateInput > infoAboutRovers[Rover].maxSol)
                {
                    marsError.innerHTML = `The minimum sol date is 0 and the maximum sol date is ${infoAboutRovers[Rover].maxSol} `;
                    Valid = false;
                }

                else {
                    marsError.innerHTML = "";

                }
            }


            //if the user selects the earth date format, construct the url accordingly
            if(dateFormat === 'earthDate'){
                URL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${Rover}/photos?earth_date=${dateInput}&camera=${Cameras.toLowerCase()}&api_key=${API_KEY}`;
            }

            //if the user selects the Mars date format, construct the url accordingly
            if(dateFormat === 'solDate'){
                URL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${Rover}/photos?sol=${dateInput}&camera=${Cameras.toLowerCase()}&api_key=${API_KEY}`;

            }

            // if the camera field is empty, display an error
            if (Cameras === "") {
                cameraError.innerHTML = "Select a camera please";
                Valid = false;
            }
            else {
                cameraError.innerHTML = "";
            }

            //if everything is valid(the input fields) fetch the photos from the NASA API
            if(Valid){
                //display a loading gif while the photos are being fetched
                loadingGif(true);

                try{

                    const response = await fetch(URL);

                    //if we don't receive a valid response from the NASA API, display an error
                    if (response.status !== 200) {
                        document.querySelector("#Error2Status").innerHTML = 'Search did not return a valid response,' +
                            ' please try again later. Status Code: ' + response.status;
                        return;
                    }

                    const image = await response.json();

                    //call for a function that displays the photos(after the search is clicked)
                    displayPhotos(image);

                }

                catch (error){
                    console.error('Error getting images', error);

                }
                    //once we get a response form the NASA API, stop displaying the loading gif
                finally {
                    loadingGif(false);
                }
            }
        });

        /**
         * this function receives an image parameter which is the images that were fetched from the NASA API
         * this function displays the photos with the info and a save button and a full size button(for every photo)
         * it's a void function, it does not return anything
         * @param image
         */
        function displayPhotos(image){

            const noImage = document.getElementById('noImage');
            const images = document.getElementById('photos');
            images.classList.add('row', 'row-cols-1', 'row-cols-md-3','g-3');
            images.innerHTML = '';

            //clear the no image text
            noImage.innerHTML = '';

            //check if there are photos based on the selected rover, date and camera by the user
            if(image.photos.length !== 0){

                //go over every photo
                image.photos.forEach(photo => {

                    //creating a div for column
                    const colDiv = document.createElement('div');
                    colDiv.classList.add('col');

                    //creating a card for every photo
                    const cardDiv = document.createElement('div');
                    cardDiv.classList.add('card');

                    //creating an img element for every photo
                    const imgeElement = document.createElement('img');
                    imgeElement.src = photo.img_src;
                    imgeElement.alt = 'Mars photos';
                    imgeElement.classList.add('img-thumbnail', 'small-img');

                    //creating a div for the card body
                    const BodyDiv = document.createElement('div');
                    BodyDiv.classList.add('card-body');

                    //creating card text with the information about the photo
                    const text = document.createElement('p');
                    text.classList.add('card-text');
                    text.innerHTML = `Earth date: ${photo.earth_date}<br>Sol: ${photo.sol}<br>Camera: ${photo.camera.full_name}<br> 
                              Mission: ${photo.rover.name}`;

                    //create a save button that saves the photo once its clicked
                    const saveBtn = document.createElement('button');
                    saveBtn.classList.add('btn', 'btn-primary', 'me-2');
                    saveBtn.textContent = 'Save';

                    //handle the click on the save button
                    saveBtn.addEventListener('click', () => {

                        //if the photo is not saved, save its id and display a message to the user that the photo
                        //was saved successfully
                        if(!savedPhotos.has(photo.id)){
                            savedPhotos.set(photo.id, {
                                id: photo.id,
                                earth_date: photo.earth_date,
                                sol: photo.sol,
                                camera: photo.camera.full_name,
                                img_src: photo.img_src
                            });

                            const successModal = new bootstrap.Modal(document.getElementById('saveSuccessModal'));
                            successModal.show();
                        }
                        //otherwise display a message using a modal that the photo was already saved
                        else{
                            const modal = new bootstrap.Modal(document.getElementById('saveModal'));
                            modal.show();
                        }
                    });

                    //create a full size button the display th image in a new window once its clicked
                    const fullSizeBtn = document.createElement('button');
                    fullSizeBtn.classList.add('btn', 'btn-primary');
                    fullSizeBtn.textContent = 'Full size';

                    //handle the click on the full size button
                    fullSizeBtn.addEventListener("click", () =>{
                        window.open(photo.img_src);
                    });

                    //appending the photo and the card text to the card body
                    BodyDiv.appendChild(imgeElement);
                    BodyDiv.appendChild(text);
                    BodyDiv.appendChild(saveBtn);
                    BodyDiv.appendChild(fullSizeBtn);

                    //appending the card body to the card and the card to the column div and the column div to the image
                    cardDiv.appendChild(BodyDiv);
                    colDiv.appendChild(cardDiv);
                    images.appendChild(colDiv);
                });

            }
            else{
                //if there are no photos create a h2 element to display the text "No images found"
                const noImage = document.getElementById('noImage');
                const element = document.createElement('h2');
                element.classList.add('text-danger');
                element.classList.add('text-center');
                noImage.innerHTML = '';
                element.innerHTML = 'No images found';
                noImage.appendChild(element);
            }

        }
        /**
         * this function displays the home page and hides the saved images page
         * it's a void function
         * this function does not receive or return anything
         */
        function home(){
            const home = document.getElementById("Home");
            const savedImg = document.getElementById("SavedImg");
            home.classList.remove('d-none');
            savedImg.classList.add('d-none');
        }
        /**
         * this function displays the saved images page and hides the home page
         * this function displays the list of the saved images with their info and a delete button
         * once the delete button is clicked, the image will be removed from the list
         * it's a void function, it does not receive or return anything
         */
        const savedImge = function(){
            const home = document.getElementById("Home");
            const savedImg = document.getElementById("SavedImg");
            savedImg.classList.remove('d-none');
            home.classList.add('d-none');

            const Text = document.getElementById('Text');
            Text.classList.add('text-primary-emphasis');
            Text.innerHTML = 'Saved Images:';

            const savedImgList = document.getElementById('savedImgList');
            savedImgList.classList.add('list-group');
            savedImgList.innerHTML = '';

            //create the list for the saved images
            savedPhotos.forEach((imgInfo, imgId) =>{

                //create the list of the saved images
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');

                listItem.innerHTML = `image id: ${imgInfo.id}</a><br>Earth date: ${imgInfo.earth_date}`;

                //create a delete button that allows the user to delete a saved image from the list
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn', 'btn-danger', 'ms-2');
                deleteBtn.textContent = 'delete';

                deleteBtn.addEventListener('click', () =>{
                    savedPhotos.delete(imgId);
                    savedImge();
                });

                listItem.appendChild(deleteBtn);
                savedImgList.appendChild(listItem);
            });

            //disable the start carousel buttons when the number of the saved images is zero
            const carouselStartBtn = document.getElementById('startCarouselBtn');
            carouselStartBtn.disabled = savedPhotos.size === 0;

            //disable the stop carousel button when the number of the saved images is zero
            const carouselStopBtn = document.getElementById('stopCarouselBtn');
            carouselStopBtn.disabled = savedPhotos.size === 0;

            //if the number of saved photos in the list is zero stop the carousel and hide it
            if(savedPhotos.size === 0){
                stopCarousel();
            }
        }

        /**
         * this function creates all the items for the carousel
         * it's a void function, it does not receive or return anything
         */
        function createCarousel(){
            const carouselInner = document.getElementById('carouselInner');
            carouselInner.innerHTML = '';


            savedPhotos.forEach(imgInfo =>{
                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');

                //create an image element
                const imgElement = document.createElement('img');
                imgElement.src = imgInfo.img_src;
                imgElement.alt = 'Mars saved photos';
                imgElement.classList.add('d-block', 'w-100');

                //write the info of the images
                const carouselCaption = document.createElement('div');
                carouselCaption.classList.add('carousel-caption','block');
                carouselCaption.innerHTML = `${imgInfo.id}<br>${imgInfo.camera}`;

                carouselItem.appendChild(imgElement);
                carouselItem.appendChild(carouselCaption);
                carouselInner.appendChild(carouselItem);

            });

        }

        /**
         *this function starts and displays a carousel of the saved images
         * it's a void function, it does not receive or return anything
         */
        function startCarousel(){
            const carouselExample = document.getElementById('carouselExample');
            carouselExample.classList.remove('d-none');
            const carouselItems = document.querySelectorAll('.carousel-item');
            let index = 0;


            /**
             * this function displays the next item(image) in the carousel, it adds the active class
             * it's a void function, it does not receive or return anything
             */
            function displayNextItem(){
                carouselItems[index].classList.remove('active');
                index = (index + 1) % carouselItems.length;
                carouselItems[index].classList.add('active');
            }

            //add the active class to the first image
            carouselItems[index].classList.add('active');

            //set the carousel interval
            carouselInterval = setInterval(displayNextItem, 5000);

        }

        /**
         * this function stops the carousel and hide the carousel from the user.
         * it's a void function, it does not receive or return anything
         */
        function stopCarousel(){
            const carouselExample = document.getElementById('carouselExample')
            clearInterval(carouselInterval);
            carouselExample.classList.add('d-none');
        }

        /**
         * this function clears all input fields and errors(once the clear button is clicked)
         * it's a void function, it does not receive or return anything
         */
        function Clear(){
            const earth = document.getElementById('earthDateField');
            const mars = document.getElementById('marsDateField');
            const Cameras = document.getElementById('Cameras');
            const Rover = document.getElementById('Rover');

            //clearing the camera field and the errors
            Cameras.options.length = 0;
            roverError.innerHTML = "";
            earthError.innerHTML = "";
            marsError.innerHTML = "";
            dateFormatError.innerHTML = "";
            Rover.selectedIndex = 0;
            mars.value = '';
            earth.value = '';

            earth.classList.add('d-none');
            mars.classList.add('d-none');


        }

        getRoversInfo().then();
        createRoverField();
        createCamerasField();
        createDateFormat();
        createHTML();

        document.getElementById('Rover').addEventListener('change', getCameras);
        document.getElementById('dateFormat').addEventListener('change', createDateFields);
        document.getElementById('homeBtn').addEventListener('click', home );
        document.getElementById('backToHomeBtn').addEventListener('click', home);
        document.getElementById('startCarouselBtn').addEventListener('click', startCarousel);
        document.getElementById('stopCarouselBtn').addEventListener('click', stopCarousel);
        document.getElementById('clearBtn').addEventListener('click',Clear);
        document.getElementById('savedImgBtn').addEventListener('click', () => {
            savedImge();
            createCarousel();
        });

        //if the user is connected to the internet remove the error message
        window.addEventListener('online', function (){
            const offlineError = document.getElementById('offlineError');
            if(offlineError){
                offlineError.innerHTML = '';
            }

        });

        //if the user is not connected to the internet display an error message
        window.addEventListener('offline', function (){
            const offlineError = document.getElementById('offlineError');
            if(offlineError){
                offlineError.innerHTML = 'You are not connected to the internet, please check your connection and try again';
            }
        });
    });
})();

