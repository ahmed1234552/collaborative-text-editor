

// to generate unique integer for siteID
 export function generateUniqueInteger() {
    // Use Date.now() to get the current timestamp
    var timestamp = Date.now();

    // Generate a random number between 0 and 9999 to add some randomness
    var random = Math.floor(Math.random() * 10000);

    // Concatenate the timestamp and random number to create a unique integer
    var uniqueInteger = timestamp.toString() + random.toString();

    return parseInt(uniqueInteger);
}
