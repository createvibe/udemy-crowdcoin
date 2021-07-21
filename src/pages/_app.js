// third party libs
// import App from 'next/app'

// global css libs
import 'semantic-ui-css/semantic.min.css';

// local libs
import Layout  from '../components/Layout';

/**
 * Overwritten next.js application
 * @param Component
 * @param pageProps
 * @returns {JSX.Element}
 * @constructor
 */
function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp