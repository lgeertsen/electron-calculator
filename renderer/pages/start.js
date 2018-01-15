import React from 'react';
import Head from 'next/head';

import TitleBar from '../containers/TitleBar';
import Calculator from '../containers/Calculator';

export default class App extends React.Component {
  render() {
    return (
      <div id="container">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <link href="https://fonts.googleapis.com/css?family=Nova+Mono" rel="stylesheet"/>
          <link href="https://use.fontawesome.com/releases/v5.0.2/css/all.css" rel="stylesheet"/>
          {/* <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css"/> */}
          <link rel="stylesheet" href="/static/mathquill-0.10.1/mathquill.css"/>
          <link rel="stylesheet" type="text/css" href="/static/css/style.css" />

          {/* <script type="text/x-mathjax-config">
          MathJax.Hub.Config({
            tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
          });
          </script> */}
          <script async src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
          {/* <script src="/static/mathquill-0.10.1/mathquill.js"></script> */}
          {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js"></script> */}
          <script type="text/javascript" async
            src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML"/>
          {/* <script defer src="https://use.fontawesome.com/releases/v5.0.2/js/all.js"></script> */}
        </Head>

        <TitleBar/>
        <Calculator/>

        <style jsx>{`

        `}</style>
        <style jsx global>{`
          html, body {
            background-color: transparent;
          }
        `}</style>
      </div>
    );
  }
}
