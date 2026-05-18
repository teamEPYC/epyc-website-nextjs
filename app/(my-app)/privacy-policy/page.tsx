import type { Metadata } from 'next'
import { LegalPage } from '@/components/sections/legal-page'
import { CTAFooter } from '@/components/sections/cta-footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How EPYC handles your data.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalPage title="Privacy Policy">
        <p>
          At EPYC, accessible from{' '}
          <a href="https://www.epyc.in/" rel="noopener noreferrer">
            https://www.epyc.in/
          </a>{' '}
          &amp;{' '}
          <a href="https://teamepyc.com/" rel="noopener noreferrer">
            https://teamepyc.com
          </a>
          , one of our main priorities is the privacy of our visitors. This
          Privacy Policy document contains the types of information collected
          and recorded by EPYC and how we use it.
        </p>
        <p>
          Please contact us if you have questions or require more information
          about our Privacy Policy.
        </p>
        <p>
          This Privacy Policy applies only to our online activities and is
          valid for visitors to our website regarding the information they
          share and collect in EPYC. This policy does not apply to any
          information collected offline or via channels other than this
          website. Our Privacy Policy was created with the help of the{' '}
          <a
            href="https://www.privacypolicygenerator.info/"
            rel="noopener noreferrer"
          >
            Privacy Policy Generator
          </a>{' '}
          and the{' '}
          <a
            href="https://www.privacypolicyonline.com/"
            rel="noopener noreferrer"
          >
            Free Privacy Policy Generator.
          </a>
        </p>

        <h4>Consent</h4>
        <p>
          Using our website, you consent to our Privacy Policy and agree to its
          terms.
        </p>

        <h4>Information we collect</h4>
        <p>
          The personal information you are asked to provide and why you are
          asked to provide it will be made clear when we ask you to provide
          your personal information.
        </p>
        <p>
          If you contact us directly, we may receive additional information
          about you, such as your name, email address, phone number, the
          contents of the message and attachments you may send us, and any
          other information you may choose to provide.
        </p>
        <p>
          When you register for an Account, we may ask for your contact
          information, including items such as name, email address, and
          telephone number.
        </p>

        <h4>How we use your information</h4>
        <p>We use the information we collect in various ways, including:</p>
        <ul>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalise, and expand our website</li>
          <li>Understand and analyse how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>
            Communicate with you, either directly or through one of our
            partners, including for customer service, to provide you with
            updates and other information relating to the website and for
            marketing and promotional purposes.
          </li>
          <li>Find and prevent fraud.</li>
        </ul>

        <h4>How long will we keep your information?</h4>
        <p>
          When users are removed (archived) from EPYC, all their data related
          to external services (including Slack and Google) is kept in our
          database for two years. After 24 months, the data is deleted from
          our database, and we no longer retain access.
        </p>

        <h4>Log Files</h4>
        <p>
          EPYC follows a standard procedure of using log files. These files
          log visitors when they visit websites. All hosting companies do this
          and are a part of hosting services&rsquo; analytics. The information
          collected by log files includes internet protocol (IP) addresses,
          browser type, Internet Service Provider (ISP), date and time stamp,
          referring/exit pages, and possibly the number of clicks. These are
          not linked to any personally identifiable information. The
          information aims to analyse trends, administer the site, track
          user&rsquo;s movement, and gather demographic information.
        </p>

        <h4>Cookies and Web Beacons</h4>
        <p>
          Like any other website, EPYC uses &lsquo;cookies&rsquo;. These
          cookies store information, including visitors&rsquo; preferences and
          the pages on the website that the visitor accessed or visited. The
          information optimises the users&rsquo; experience by customising our
          web page content based on visitors&rsquo; browser type and/or other
          information.
        </p>
        <p>
          Please read{' '}
          <a
            href="https://www.termsfeed.com/blog/cookies/"
            rel="noopener noreferrer"
          >
            &ldquo;What Are Cookies&rdquo;
          </a>{' '}
          from Cookie Consent for more general cookie information.
        </p>

        <h4>Advertising Partners Privacy Policies</h4>
        <p>
          You may consult this list to find the Privacy Policy for each of the
          advertising partners of EPYC.
        </p>
        <p>
          Third-party ad servers or ad networks use technologies like cookies,
          JavaScript, or Web Beacons used in their respective advertisements
          and links that appear on EPYC, which are sent directly to
          users&rsquo; browsers. They automatically receive your IP address
          when this occurs. These technologies are used to measure the
          effectiveness of their advertising campaigns and/or personalise the
          advertising content you see on websites you visit.
        </p>
        <p>
          Note that EPYC has no access to or control over third-party
          advertisers&apos; cookies.
        </p>

        <h4>Third Party Privacy Policies</h4>
        <p>
          EPYC&rsquo;s Privacy Policy does not apply to other advertisers or
          websites. Thus, we are advising you to consult the respective
          Privacy Policies of these third-party ad servers for more detailed
          information. It may include their practices and instructions about
          opting out of specific options.
        </p>
        <p>
          You can choose to disable cookies through your browser options. More
          detailed information about cookie management with specific web
          browsers can be found on the browsers&rsquo; respective websites.
        </p>

        <h4>Children&apos;s Information</h4>
        <p>
          Another part of our priority is adding protection for children while
          using the internet. We encourage parents and guardians to observe,
          participate in, monitor, and guide their online activity.
        </p>
        <p>
          Obvious does not knowingly collect any Personal Identifiable
          Information from children under 13. Suppose your child provided this
          kind of information on our website. In that case, we strongly
          encourage you to contact us immediately, and we will do our best to
          remove such information from our records promptly.
        </p>
      </LegalPage>
      <CTAFooter />
    </>
  )
}
