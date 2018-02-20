export default {
  render(level, origin, message) {
    const timeDate = new Date().toUTCString();
    console.log(`${timeDate} - [${level}] ${origin}:`);
    console.log(message);
    console.log();
  },
};

