# Hacking tech open air

So you want to get some free upvotes to win the Tech open Air, just before the deadline?

## Installing

Download this project and run 

```
npm install
```

### Proxies

You will need to have some proxies for this project to make your votes count

Inside Proxies.js there is a list of more than 400 proxies.

You can authenticate yourself via a credentials file. 

### create the credentials file

create a folder called: 'credentials.js' and create a file named: 'proxyCredentials.js'

the content of your 'proxyCredentials.js' should look something like this:

```
module.exports = {
    username: *_USERNAME_*,
    password: *_PASSWORD_*
}
```

### Edit the settings

Inside run.js there is a variable named: 'spId' with the value 21544.
Change this value to your own Id. 
You can find your Id in the DOM of the page. (if you don't know what that is.. then you are way to far in this page)

If you want you can change the treshold variable to any number. 
The treshold is the amount of difference in votes you will win. 

e.g. If a company has 100 votes and you have 51, and the threshold is 50 then the script won't vote for you.

If you want to change to amount of times the script votes for you at once, you have to change to amountOfProxies variable.
Make sure you have enough proxies.

### Run the script and have fun

Finaly open up your console and run 'node run.js'
Be amazed and have fun. 

### Why did you come this far?

Well. You have proven yourself amongst the best,
We are hiring!

https://www.studyportals.com/careers/
https://www.facebook.com/studyportalscareers/


