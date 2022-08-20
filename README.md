[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <img src="https://docs.hcaptcha.com/img/logo.svg" alt="Logo" height="60">

  <h3 align="center">captcha-for-all-api</h3>

  <p align="center">
    Tries to provide captcha functionality everywhere where there is none
    <br />
    <br />
    ·
    <a href="https://github.com/beuluis/captcha-for-all-api/issues">Report Bug</a>
    ·
    <a href="https://github.com/beuluis/captcha-for-all-api/issues">Request Feature</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

Small docker setup to provide captcha functionality everywhere where there is none. Utilizes [NestJS](https://nestjs.com/).

<!-- GETTING STARTED -->

## Getting Started Develop

To get a local copy up and running follow these simple steps.

### Prerequisites

-   [Docker](https://docs.docker.com/get-docker/)
-   [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1. Clone the repo

```sh
git clone https://github.com/beuluis/captcha-for-all-api.git --branch develop
```

2. Start docker-compose

```sh
docker-compose up --build
```

3. Call the api with `localhost:{your port}` as base url

### Customization

1. Create a `.env` file

```sh
touch .env
```

2. Overwrite variables as you like (format: `{variable name}={variable value}`)

| Variable          | Description                               | Default value                              | Required |
| ----------------- | ----------------------------------------- | ------------------------------------------ | -------- |
| `INSPECT_PORT`    | Node inspect port                         | 9229                                       | false    |
| `PORT`            | Which port is mapped to your host machine | 3300                                       | false    |
| `CAPTCHA_SITEKEY` | HCapthca sitekey                          | 0x0000000000000000000000000000000000000000 | false    |
| `CAPTCHA_SECRET`  | HCapthca secret                           | 10000000-ffff-ffff-ffff-000000000001       | false    |

## Endpoint dokumentation

The endpoints are documented in swagger. You can navigate to swagger on your local instance, like `localhost:{your port}/api`.
Or view them [here](https://petstore.swagger.io/?url=https://raw.githubusercontent.com/beuluis/captcha-for-all-api/main/docs/swagger.json).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- CONTACT -->

## Contact

Luis Beu - me@luisbeu.de

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/beuluis/captcha-for-all-api.svg?style=flat-square
[contributors-url]: https://github.com/beuluis/captcha-for-all-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/beuluis/captcha-for-all-api.svg?style=flat-square
[forks-url]: https://github.com/beuluis/captcha-for-all-api/network/members
[stars-shield]: https://img.shields.io/github/stars/beuluis/captcha-for-all-api.svg?style=flat-square
[stars-url]: https://github.com/beuluis/captcha-for-all-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/beuluis/captcha-for-all-api.svg?style=flat-square
[issues-url]: https://github.com/beuluis/captcha-for-all-api/issues
[license-shield]: https://img.shields.io/github/license/beuluis/captcha-for-all-api.svg?style=flat-square
