/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

function Help(props) {
  const {config: siteConfig, language = ''} = props;
  const {baseUrl, docsUrl} = siteConfig;
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const langPart = `${language ? `${language}/` : ''}`;
  const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

  const supportLinks = [
    {
      title: 'Browse Docs',
      content: `Learn more about IRMA using the [documentation on this site.](${docUrl(
        'what-is-irma',
      )})`,
    },
    {
      title: 'Slack',
      content: 'In our Slack channel we discuss all IRMA matters, technical and otherwise. <a href="https://privacybydesign.foundation/people/#developers">Ask for an invite</a>.',
    },
    {
      title: 'Twitter',
      content: 'You can follow and contact us on <a href="https://twitter.com/irma_privacy">Twitter</a>.',
    },
    {
      title: 'GitHub',
      content: 'Read and contribute to the IRMA source code on <a href="https://github.com/privacybydesign">GitHub</a>.',
    }
  ];

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>About IRMA</h1>
          </header>
          <p>IRMA is developed and maintained by the <a href="https://privacybydesign.foundation/">Privacy by Design Foundation</a>, and is <a href="https://en.wikipedia.org/wiki/Free_and_open-source_software">free and open source</a>. See the Foundation's website for news about IRMA; how you can support IRMA; statistics on the Foundation's IRMA infrastructure; scientific publications related to IRMA; and more.</p>
          <ul>
            <li><a href="https://privacybydesign.foundation/issuance/">IRMA attribute issuance</a></li>
            <li><a href="https://privacybydesign.foundation/irma-start/">IRMA introduction for IRMA app users</a></li>
          </ul>
          <GridBlock contents={supportLinks} layout="fourColumn" />
        </div>
      </Container>
    </div>
  );
}

module.exports = Help;
