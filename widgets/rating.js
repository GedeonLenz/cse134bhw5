document.addEventListener('DOMContentLoaded', (e) => {
    class RatingWidget extends HTMLElement {
        clicked = false
        constructor() {
            super();

            //Create shadow DOM
            let shadowRoot = this.attachShadow({ mode: 'open' });

            //Define star count
            let starCount = document.getElementById('rating').getAttribute('max') ? document.getElementById('rating').getAttribute('max') : 5;
            if(starCount < 3) {
                starCount = 3;
            }
            else if(starCount > 10) {
                starCount = 10;
            }

            //Build star html
            let starsElements = '';
            for(let i = 0; i < starCount; i++) {
                starsElements += `<span class="star" id="star-${i+1}">★</span>`;
            }

            this.shadowRoot.innerHTML = `
            <h2>Rating widget</h2>
            <style>
                .star {
                    color: var(--star-color-selected, #3b3b3b);
                    cursor: pointer;
                }
                .star:hover {
                    color: var(--star-color-hover, rgb(105,105,105));
                }
                .deactivated {
                    cursor:default;
                }
                .deactivated:hover {
                    color: var(--star-color-selected, #3b3b3b);
                }
                .filledstar {
                    color: var(--star-color,gold);
                    cursor:default;
                }
                .filledstar:hover {
                    color: var(--star-color,gold);
                }
            </style>
            <section>
                ${starsElements}
            </section>
        `;

            shadowRoot.addEventListener('click', (e) => {
                if(e.target.classList.contains('star') && !this.clicked) {
                    this.clicked = true;

                    //Modify star styling
                    let amount = e.target.id.split('-')[1];
                    let stars = shadowRoot.querySelectorAll('.star');
                    for(let i = 0; i < stars.length; i++) {
                        if(i+1 <= amount) {
                            stars[i].classList.add('filledstar');
                        }
                        else {
                            stars[i].classList.remove('filledstar');
                            stars[i].classList.add('deactivated');
                        }
                    }

                    //Display message
                    let percent = amount / starCount * 100;
                    if(percent >= 80) {
                        this.shadowRoot.innerHTML = this.shadowRoot.innerHTML + "<p>Thanks for "+amount+" star rating!</p>";
                    }
                    else {
                        this.shadowRoot.innerHTML = this.shadowRoot.innerHTML + "<p>Thanks for your feedback of "+amount+" stars. We'll try to do better!</p>";
                    }

                    //Send request
                    const endpoint = 'https://httpbin.org/post';
                    const formData = new FormData();
                    formData.append('question', 'How satisfied are you?');
                    formData.append('sentBy', 'JS');
                    formData.append('rating', amount+'');
                    const additionalHeaders = new Headers({
                        'X-Sent-By': 'JS'
                    });
                    fetch(endpoint, {
                        method: 'POST',
                        body: formData,
                        headers: additionalHeaders
                    })

                        //Print response
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Response:', data);
                        })
                }
            });
        }
    }

    customElements.define('rating-widget', RatingWidget);
});