<h1 align="center">Light Web-Pages</h1>

Light Web-Pages (LWP) is a mechanism for redirecting users automatically to the *lighter* versions of the web-pages they
visit.

* [What is LWP?](#what-is-lwp)
* [What LWP tries to solve?](#what-lwp-tries-to-solve)
  * [Is LWP an enhancement over AMP?](#is-lwp-an-enhancement-over-amp)
* [How LWP works?](#how-lwp-works)
  * [Automatic redirection](#automatic-redirection)
  * [Pre-fetching](#pre-fetching)
    * [Pre-fetching FAQ](#pre-fetching-faq)
* [How to use LWP?](#how-to-use-lwp)
  * [Configuring an Apache HTTP Server](#configuring-an-apache-http-server)
  * [Using Light Web-Pages Add-On](#using-light-web-pages-add-on)
  * [Demo](#demo)
* [License](#license)

## What is LWP?
LWP is a proposal to add a new header in HTTP GET and HEAD requests, indicating the client's preference in favour of a
*lighter* version of the requested resource. The server, then, should redirect the client to the *lighter* version of
the requested resource, if exists.

LWP is proposed as an open alternative to the current proprietary solutions, to keep the Web free, and also to make it
*accessible* to users with limited/bad Internet connections.

## What LWP tries to solve?
The average web-page size increases steadily and regardless of whether it might be considered as a bloat or not, it
constitutes a problem for many users on mobile and other platforms with *bad* Internet connections. There is a trend,
as we might call, which led to numerous projects to solve the problem, and the central idea is to increase the
[perceived performance](https://en.wikipedia.org/wiki/Perceived_performance) of the web-pages through various
techniques, such as pre-fetching content in the background, using optimised assets and formats and so on, but most
importantly, reducing (and limiting) the amount and the kind of content that can be used. Most popular examples of such
projects are:

* Facebook's [Instant Articles](https://instantarticles.fb.com/)
* Apple's [News](https://www.apple.com/news/)
* Google's [Accelerated Mobile Pages](https://www.ampproject.org/)

First two of these examples are completely proprietary solutions designed to be used only within the closed software
ecosystems of the corporations developing them. Google's Accelerated Mobile Pages, on the other hand, is an
open-specification powered by open-source libraries that doesn't require an additional client but only a
standards-compliant web-browser. Very briefly, AMP works by lazy-loading resources and by loading them as much
asynchronously as possible to ensure that the user downloads what s/he needs at the moment only, and that happens in
the fastest way possible.

The problem with AMP is that although it is an open-specification with open-source libraries, it currently depends on
Google on three important areas:

* There are no available mechanisms to redirect users automatically to the AMP version of a web-page, and we have to
  depend on Google Search to do that for us (which is not opt-in, and users cannot opt-out either).

* Pre-fetching AMP-pages works only on Google Search, although there are fully standards-compliant ways to do that in
  HTML 5 (explained later on).

* Visitors coming from Google Search will visit the Google-cached copy of your AMP-page without leaving `google.com` at
  all.

  (Some web-sites [*e.g.* The New York Times] do not even allow users to access AMP-versions of their web-pages
  directly and instead redirects them to the mobile version
  [[for instance](https://mobile.nytimes.com/2017/05/13/technology/google-education-chromebooks-schools.amp.html)].)

All these combined raises some very valid concerns regarding the overly-centralised nature of the open-source AMP
project, in contrast to the decentralised nature of the Web that consists of hyperlinks to other web-pages that live
on different domains and servers. **Indeed, it wouldn't be an exaggeration to say that AMP is akin to Instant Articles
and (Apple) News, while the difference being that Google's client works on a web browser and very well integrated to its
Search.**

### Is LWP an enhancement over AMP?
**NO.** Although you can use LWP as a mechanism to serve AMP pages without relying on Google, you can use LWP to serve
*any* web-page that you deem to be the *lighter* version of another.

Another significant difference is that while AMP focuses on mobile devices only, **LWP embraces both mobile and desktop
users**, as we think that the quality of your Internet connection is what matters, and it does not only depend on the
device you use, but also (and mainly) on the location (*i.e.* whether between the mountains or in the middle of a city),
your economic status with respect to your ISP (*i.e.* how much bandwidth and gigabytes per month can you afford), and
a variety of other factors. **According to Akamai's
[Q1 2017 State of the Internet / Connectivity Report](https://content.akamai.com/gl-en-pg9135-q1-soti-connectivity.html)
the global average connection speed is 7.2 Mbps**.

## How LWP works?

### Automatic redirection
__`LWP` is an HTTP header, to be added in GET requests, indicating the user's preference on *light* web-pages.__

There are three different outcomes of a GET request regarding the `LWP` header:

1. __If the `LWP` header not exists in a GET request__, the server MUST behave as usual.

   This is about backwards-compatibility and meeting the expectations: we should **not** surprise any software that is
   not LWP-aware and redirect them to a different *version* of a resource, which is, technically speaking, a different
   resource. Although we would not be breaking any specifications when we redirect, we would be acting against the
   expectations of *actual users*, who might get frustrated for not being able to access the *exact* resource s/he
   wants.

2. __If the `LWP` header in a GET request is set to `"1"`__, the server SHOULD respond with a 303 "See Other" where the
   `Location` is the URI of the *lighter* version of the requested resource, if exists. The client, then, MUST act upon
   the receipt of the response just as usual.

   The client SHALL NOT assume that the server is redirecting because of the `LWP` header, as it might be caused by
   something entirely else as well. Nevertheless, in both cases, the client ought to follow the HTTP specification for
   the response from the server.

   __Why 303 "See Other"?__

   * Because of the semantics; compare the following two quotations:

     > The new URI is not a substitute reference for the originally requested resource.
     >
     > [303 "See Other" - RFC 2616](https://www.ietf.org/rfc/rfc2616.txt)

     and

     > The requested resource resides temporarily under a different URI.
     >
     > [302 "Found" - RFC 2616](https://www.ietf.org/rfc/rfc2616.txt)

     Since *light* pages are **not** substitute references for the original pages (since they are technically different
     **documents**), we thought that 303 "See Other" would be a better fit.

   * Because of the caching rules:

     > The 303 response MUST NOT be cached, but the response to the second (redirected) request might be cacheable.
     >
     > [303 "See Other" - RFC 2616](https://www.ietf.org/rfc/rfc2616.txt)

     So, every single time, the redirection depends on the respond from the server, but if 303 "See Other" received for
     a given request, it can be served from the cache whenever possible.

3.  __If the `LWP` header in a GET request is set to `"0"`__, the server SHOULD respond with a 303 "See Other" where the
   `Location` is the URI of the *heavier*/original version of the requested resource, if exits. The client, then, MUST act upon
   the receipt of the response just as usual.

    Any client software that uses `LWP` header can safely be assumed to be LWP-aware, hence, if it's set to zero, the
    server MUST redirect the client to the original version of the resource.


### Pre-fetching
If you think that the user might follow some of the links presented in your web-page, you can instruct the browser to
*pre-fetch* them by adding the appropriate `<link>`s in the `<head>`:

    <link rel="prefetch" href="https://example.com/test">

Pre-fetching is **already** a Web standard, so this section is provided as a friendly guide on how to do that without
relying on others and using only standards-compliant ways.

Please also note that whether to pre-fetch a resource or not is **completely up to the client/browser**, even if user
enabled the feature.

#### Pre-fetching FAQ
*From: https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ*

* __Is link prefetching standards compliant?__

  Yes, link prefetching as outlined in this document does not violate any existing web standards. [...] However, the
  exact mechanism employed by Mozilla is not yet standardised. [...] Standardisation of this technique is part of the
  scope of HTML 5, see the current working draft,
  [section §5.11.3.13. Link type "prefetch"](http://www.whatwg.org/specs/web-apps/current-work/#link-type-prefetch).

* __Will browser prefetch documents from a different host?__

  Yes. There is no same-origin restriction for link prefetching.

* __Do prefetched requests contain a Referer: header?__

  Yes, prefetched requests include an HTTP `Referer:` header indicating the document from which the prefetching hint was
  extracted.

* __Do users have a preference to disable link prefetching?__

  Yes, there is a hidden preference that users can set to disable link prefetching at least on Mozilla Firefox.

* __Which browsers support link prefetching?__

  See https://caniuse.com/#feat=link-rel-prefetch.

## How to use LWP?

### Configuring an Apache HTTP Server
Thanks to `mod_rewrite`, enabling LWP support on Apache is a straightforward process. Let's say that *lighter* resources
are located under `light/`, followed by the same path of the *heavier*/original resource. For instance,
the lighter version of

    https://www.nytimes.com/2017/05/13/technology/google-education-chromebooks-schools.html

would be

    https://www.nytimes.com/light/2017/05/13/technology/google-education-chromebooks-schools.html

and so on. In this case, you can use the following configuration in your `.htaccess` in the
**[DocumentRoot](https://httpd.apache.org/docs/2.4/urlmapping.html#documentroot)**:

    # Enable Rewrite Engine (duh).
    RewriteEngine on


    # If LWP header is equal to "0" (heavy/original content is preferred) AND
    RewriteCond %{HTTP:LWP} =0

    # if the effective URL starts with "/light/" or is just "/light" AND
    RewriteCond %{REQUEST_URI} ^/light(/.*|)$

    # if the will-be-redirected URL exists (check whether the file/directory exists)
    RewriteCond %{DOCUMENT_ROOT}%1 -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%1 -d

    # THEN redirect the client to the original URL minus "light/" prefix.
    RewriteRule ^light/(.*)$ $1 [R=303,L]


    # If LWP header is equal to "1" (lighter content is preferred) AND
    RewriteCond %{HTTP:LWP} =1

    # if the effective URL neither starts with "/light/" nor is just "/light" AND
    RewriteCond %{REQUEST_URI} !^/light(/.*|)$

    # (this is just to catch the path, to be used in the next group)
    RewriteCond %{REQUEST_URI} ^(/.*|)$

    # if the will-be-redirected URL exists (check whether the file/directory exists)
    RewriteCond %{DOCUMENT_ROOT}%1 -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%1 -d

    # THEN redirect the client to the orignal URL prefixed with "light/"
    RewriteRule ^(.*) light/$1 [R=303,L]

The configuration will redirect the client only if redirection doesn't cause a 404 "Not Found" error, and this is achieved
by checking if to-be-redirected file and/or directory exists: it's not the right way to do things since there are other
deciding factors whether a client can access a given file/directory, but it should be sufficient for demonstration
purposes.

__That's all there is!__ Of course, depending on the structure and the complexity of your setup, you might want to
handle redirection somewhere else in the stack or somewhat differently.

### Using Light Web-Pages Add-On
__Currently, the support for LWP on client side is implemented using Light Web-Pages Add-On__, that is developed using
WebExtensions, and works on Google Chrome/Chromium and Mozilla Firefox. It is hoped that once LWP gains attention and
enough support from the community, it will be supported natively by the web browsers and become a standard of the open
Web.

![Screenshot of Light Web-Pages Add-On](assets/lwp-addon-ss.png)

* For Mozilla Firefox: [light_web_pages-v0.1.0.xpi](https://github.com/boramalper/light-web-pages/releases/download/v0.1.0/light_web_pages-v0.1.0.xpi)
* For Google Chrome/Chromium: [light_web_pages-v0.1.0.crx](https://github.com/boramalper/light-web-pages/releases/download/v0.1.0/light_web_pages-v0.1.0.crx)

### Demo
http://labs.boramalper.org/light-web-pages/demo (requires the add-on to be installed)


## License
This document is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons
Attribution 4.0 International License</a>.

Light Web-Pages Add-On is licensed under an [MIT License](https://opensource.org/licenses/MIT).

----
Do you have anything to contribute? Feel free to send me, Bora M. Alper, an [e-mail](mailto:bora@boramalper.org) or open
an issue on the [GitHub page](https://github.com/boramalper/light-web-pages) of the project!
