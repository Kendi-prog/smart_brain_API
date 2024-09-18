const getRequestOptionsJSON = (imgUrl) => {
  const PAT = '46bf2c0a326e458baff008dd2231a166';
  const USER_ID = 'clarifai';
  const APP_ID = 'main';
  const MODEL_ID = 'face-detection';
  const IMAGE_URL = imgUrl;

  const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                      // "base64": IMAGE_BYTES_STRING
                  }
              }
          }
      ]
  });

  const requestOptions = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
  };

  return requestOptions;
}

const handleApiCall = (req, res) => {
  fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", getRequestOptionsJSON(req.body.input))
  .then(response => response.json())
  .then(data => {
    res.json(data);
  })
  .catch(err => res.status(400).json('unable to work with API'));
}


const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
  .where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0].entries);
  })
  .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
  handleImage,
  handleApiCall
};