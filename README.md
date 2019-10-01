# Hotel Crawler by Next Dev from AskSuite's DreamTeam

## Project setup

```
yarn install
yarn start
```

OR

```
docker-compose up
```

## Run tests

```
yarn run test
```

## API Description

Returns json data with hotel rooms.

- **URL:**
  api/buscar/

- **Method:**
  `POST`

- **Data Params:**

  **Required:**

  ```
  {
    "checkin": [date],
    "checkout": [date]
  }
  ```

  **Example:**

  ```
  {
    "checkin": "01/09/2019", // DD/MM/YYYY
    "checkout": "03/09/2019"
  }
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content example:**

    ```json
    [
      {
        "name": "name 1",
        "price": "R$ 123,90",
        "description": "Lorem ipsum",
        "image": ["img1.png", "img2.png"]
      },
      {
        "name": "name 2",
        "price": "R$ 456,90",
        "description": "Lorem ipsum",
        "image": ["img3.png", "img4.png"]
      }
    ]
    ```

    or empty array

    ```json
    []
    ```

- **Sample Call:**
  ```
    curl -X POST \
    http://localhost:3000/api/buscar \
    -H 'content-type: application/json' \
    -d '  {
        "checkin": "02/10/2019",
        "checkout": "05/10/2019"
    }'
  ```
