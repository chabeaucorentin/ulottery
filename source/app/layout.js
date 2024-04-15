const RootLayout = ({ children }) => {
    return (
        <html lang="fr">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />
                <meta name="author" content="Équipe 7" />
                <meta name="description" content="Projet de session (Équipe 7)" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="IFT-7100" />
                <meta name="application-name" content="IFT-7100 - Projet de session" />
                <meta name="theme-color" content="#F4F4F4" />

                <title>uLottery | IFT-7100</title>

                <link rel="apple-touch-icon" href="./assets/images/favicon/apple-touch-icon.png" sizes="180x180" />
                <link rel="shortcut icon" href="./assets/images/favicon/favicon.ico" sizes="32x32" />
                <link rel="icon" href="./assets/images/favicon/favicon.svg" sizes="any" type="image/svg+xml" />
                <link rel="manifest" href="./assets/images/favicon/manifest.json" />

                <link rel="stylesheet" href="./assets/css/reset.css" />
                <link rel="stylesheet" href="./assets/css/fonts.css" />
                <link rel="stylesheet" href="./assets/css/style.css" />
            </head>
            {children}
        </html>
    );
}

export default RootLayout;
