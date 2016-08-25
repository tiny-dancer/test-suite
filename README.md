# Exponent Test Suite

Hi! This is what will make Exponent never break ever. 🙏


## Running tests

Just run this on XDE or exp and point Exponent to the URL. You can navigate to `<theurl>/+<regexp>` to only run tests whose names match the regexp. The tests are in `Tests/` and their name usually is the same as the filename.

There is also a published version of this at exp://exp.host/@nikki/test-suite. So you can go to, for example, exp://exp.host/@nikki/test-suite/+Assets.* to run the asset tests!


## Adding tests

Add a file in `Tests/`, or, if your test falls into one of the categories already there, edit one of the files there. The `name` export of the module defines the test name, and it must also export a function `test` that takes an argument `t` which will have the functions explained in http://jasmine.github.io/2.4/introduction.html (so, for example, the global `describe` function refered to in that documentation can be accesssed as `t.describe`). Check out one of the tests already in `Tests/` to get an idea of how stuff is done.

One neat thing is that you can focus to certain subtrees of test using `fdescribe` or `fit` and the other tests are skipped. If you do this on a local instance of the app code and send the link to someone, they will run that test. Then you can change the test and have them refresh to see the changes. This way you can debug things on someone else's device, isolate the issue and maybe even fix it live (if it is a pure JS bug).

Make sure to go over the Jasmine documentation at http://jasmine.github.io/2.4/introduction.html to get an idea of all the functionality supported. In addition to what Jasmine offers, this app patches the Jasmine functions so they support `async ` functions as well. Asynchronous exceptions are properly caught and displayed too. See `Tests/Contacts.js` for an example of using `async/await` in a test context. This is important for us because basically most of the SDK's functionality is asynchronous.

