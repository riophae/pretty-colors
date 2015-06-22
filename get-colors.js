let writefile = require('writefile');
let Ripple = require('../Ripple');

let credentials = require('./credentials.json');

Ripple.setupConsumer(credentials.consumer);

let ripple = new Ripple(credentials.accessToken);

let colors = {};

let request = (maxId) => {
  console.log(`Loading... ${maxId}`);

  return ripple.getUserTimeline({
    screen_name: 'RGB_Colours',
    count: 100,
    max_id: maxId
  });
};

let load = (maxId) => {
  return request(maxId).next((data) => {
    if (data.length <= 1) {
      output();
      return;
    }

    data.forEach((tweet) => {
      let _, colorName, color, comment;

      [ _, colorName ] = tweet.text.match(/"(.+)"/) || [];
      [ _, color ] = tweet.text.match(/#([a-f0-9]{6}|[a-f0-9]{3})/) || [];

      if (!colorName || !color) {
        return;
      }

      // remove `(CSS)`, `(Web Color)`, etc. from `colorName`
      if (/\(.+\)/.test(colorName)) {
        [ comment ] = colorName.match(/\s*\(.+\)\s*/) || [];
        if (/\b(html|css|web|colou?r)\b/i.test(comment)) {
          colorName = colorName.replace(comment, '');
        }
      }

      if (color.length === 3) {
        color = color.split('').map((letter) => {
          return letter + letter;
        }).join('');
      }

      colors[color] = colorName;
    });

    return load(data[data.length - 1].id_str);
  });
}

let output = () => {
  console.log('Output...');

  writefile('./dist/colors.json', JSON.stringify(colors));
};

load().error((err) => {
  console.error(err);
});
