const jsonInput = JSON.parse(process.argv.slice(2).join(''));

if (Object.keys(jsonInput).length <= 0) {
  process.exit(0);
}

console.log('\x1b[36m');
console.log('The following updates were found:\n');
Object.keys(jsonInput).forEach((key) => {
  const currentEl = jsonInput[key];
  console.log(`${key}@${currentEl.current} -> ${currentEl.latest}`);
});
console.log('\x1b[0m');
