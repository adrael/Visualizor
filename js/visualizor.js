/**
 * @author Raphaël MARQUES
 *
 * @file visualizor.js
 * @module Visualizor
 */

window.Visualizor =
    (function () {

        // Application packaging
        var vm = this;

        vm.initialize = initialize;

        return vm;

        /**
         * The initialization function.
         * @name initialize
         * @return {Object} this for chaining purposes
         * @function
         */
        function initialize() {

            console.log('[+] Initializing Visualizor...');

            setUpTitle();
            createSoundEngine();
            setUpAnalyser();
            setUpFileOpening();

            console.log('[+] Visualizor ready.');

            return this;

        }

        /**
         * Create the game sound engine.
         * @name createSoundEngine
         * @return {Object} this for chaining purposes
         * @function
         */
        function createSoundEngine() {

            console.log('[+] Creating sound engine...');

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            vm.audioContext = new AudioContext();

            console.log('[+] Sound engine ready.');

            return this;

        }

        /**
         * Set the title.
         * @name setUpTitle
         * @return {Object} this for chaining purposes
         * @function
         */
        function setUpTitle() {

            console.log('[+] Setting up title...');

            var text = document.getElementById('title'),
                steps = 7;

            function titleTo3D(mouseMouveEvent) {

                var x = Math.round(steps / (window.innerWidth / 2) * (window.innerWidth / 2 - mouseMouveEvent.clientX)),
                    y = Math.round(steps / (window.innerHeight / 2) * (window.innerHeight / 2 - mouseMouveEvent.clientY)),
                    shadow = '',
                    color = 190;

                for (var i = 0; i < steps; ++i) {

                    var tx = Math.round(x / steps * i);
                    var ty = Math.round(y / steps * i);

                    if (tx || ty) {

                        color -= 3 * i;
                        shadow += tx + 'px ' + ty + 'px 0 rgb(' + color + ', ' + color + ', ' + color + '), ';

                    }

                }

                shadow += x + 'px ' + y + 'px 1px rgba(0,0,0,.2), ' + x * 2 + 'px ' + y * 2 + 'px 6px rgba(0,0,0,.3)';

                text.style.textShadow = shadow;
                text.style.transform = 'translateZ(0) rotateX(' + y * 1.5 + 'deg) rotateY(' + -x * 1.5 + 'deg)';

            }

            document.addEventListener('mousemove', titleTo3D, false);

            console.log('[+] Title set up.');

            return this;

        }

        /**
         * Set the file opening.
         * @name setUpFileOpening
         * @return {Object} this for chaining purposes
         * @function
         */
        function setUpFileOpening() {

            console.log('[+] Setingt up file opening...');

            $('#file').click(
                function () {

                    var path = window.prompt('Please enter the full path to your music file:', '');
                    if (path && path !== '') {

                        console.log('[+] Loading new file:', path);
                        $('#player').attr('src', path).attr('autoplay', true);

                    }

                }
            );

            console.log('[+] File opening set up.');

            return this;

        }

        /**
         * Set the analyser.
         * @name setUpAnalyser
         * @return {Object} this for chaining purposes
         * @function
         */
        function setUpAnalyser() {

            console.log('[+] Setting up analyser...');

            // Create the analyser
            var analyser = vm.audioContext.createAnalyser();
            analyser.fftSize = 1024;

            var frequencyData = new Uint8Array(analyser.frequencyBinCount);

            // Set up the visualisation elements
            var visualisation_up = $("#visualisation_up"),
                visualisation_down = $("#visualisation_down"),
                barSpacingPercent = 100 / analyser.frequencyBinCount;

            for (var i = 0; i < analyser.frequencyBinCount; ++i) {

                var position = i * barSpacingPercent + "%";

                $("<div/>").css("right", position).appendTo(visualisation_up);
                $("<div/>").css("left", position).appendTo(visualisation_down);

            }

            var bars_up = visualisation_up.find("> div"),
                bars_down = visualisation_down.find("> div");

            // Get the frequency data and update the visualisation
            function update() {

                requestAnimationFrame(update);

                analyser.getByteFrequencyData(frequencyData);

                bars_up.each(
                    function (index, bar) {

                        bar.style.backgroundColor = getColorForFrequency(frequencyData[index]);
                        bar.style.height = frequencyData[index] * 1.5 + 'px';

                    }
                );

                bars_down.each(
                    function (index, bar) {

                        bar.style.backgroundColor = getColorForFrequency(frequencyData[index]);
                        bar.style.height = frequencyData[index] * 1.5 + 'px';

                    }
                );

            }

            // Hook up the audio routing...
            $("#player").bind('canplay',
                function () {
                    if (!vm.alreadyBound) {

                        var source = vm.audioContext.createMediaElementSource(this);
                        source.connect(analyser);
                        analyser.connect(vm.audioContext.destination);

                        vm.alreadyBound = true;

                    }
                }
            );

            update();

            console.log('[+] Analyser ready.');

            return this;

        }

        /**
         * Set a color for a given frequency.
         * @name getColorForFrequency
         * @return {String} The color
         * @function
         */
        function getColorForFrequency(frequency) {

            if (frequency >= 170) {
                return 'red';
            }

            if (frequency >= 130) {
                return 'orangered';
            }

            if (frequency >= 90) {
                return 'darkorange';
            }

            if (frequency >= 50) {
                return 'green';
            }

            return 'lime';

        }

    })();