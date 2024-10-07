const string = `<user1> this is some chat words
<user2> the sky is blue
This line is still attributed to the user above haha
<user1> more chat from me! 38gad81`

function assignTextsToUsers(chatString) {
  const lines = chatString.split('\n');
  // dict to store user's text
  const userTexts = {};
  let currentUser = null;

  lines.forEach(line => {
    const userMatch = line.match(/^<([^>]+)>/); // Match <user1>, <user2>, etc.

    if (userMatch) {
      currentUser = userMatch[1]; // Extract the user (e.g., user1, user2)
      const text = line.replace(/^<[^>]+>\s*/, ''); // Remove the user part from the text
      if (!userTexts[currentUser]) {
        userTexts[currentUser] = []; // assign empy containers
      }
      userTexts[currentUser].push(text);
    } else if (currentUser) {
      userTexts[currentUser].push(line); // Continue attributing text to the current user
    }
  });

  return userTexts;
}

function getChattiestUser(str) {
  // extract string into more structured data
  const usersText = assignTextsToUsers(str)

  // iterate over chat dict, to get total amount to word per user. store in another dict = counter
  const userTextCounter = {}
  for (let [user, texts] of Object.entries(usersText)) {
    // texts is an array of string
    let counter = 0
    for (let text of texts) {
      const totalWord = text.split(" ").length
      counter += totalWord
    }
    userTextCounter[user] = counter
  }


  // sort counter desc
  const sorted = Object.entries(userTextCounter)
    .sort((a, b) => b[1] - a[1]) // sort descending
    .map(dict => dict[0]) // return username only


  return sorted
}