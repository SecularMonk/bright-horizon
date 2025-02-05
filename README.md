# bright-horizon

A small application for generating job recommendations, using data sourced from the Bright Network API.

## Table of Contents

1. [Overview](#overview)
2. [Problem space](#problem-space)
3. [Solution](#solution)
4. [Infrastructure & testing](#infrastructure--testing)
5. [Setup](#setup)

## Overview

This project generates job recommendations for candidates sourced from the bright network API.

### Problem space

At its core, matching users to jobs is a ranking/similarity search problem. We're using imperfect data about what someone wants to give our best guess as to what works for them. A simple strategy to achieve this is finding the closest match across the available dimensions of jobs and locations.

The data available is uncategorised, so requires some parsing and transformation to make it usable. For example, take this bio:

> "I'm looking for a job in marketing outside of London"

Our goal is to examine this sentence and extract the desired field (marketing) and location (outside of London). "A challenge arises with modifiers like 'outside of,' where a naive match would yield incorrect results.

There are 2 good options for doing this: Natural Language Processing (NLP), and using an LLM like ChatGPT.

Given the scale of available jobs at any given time (likely thousands), and userbases with a very high upper limit, using ChatGPT would become very expensive very quickly without a little pre-processing. For that reason I opted to use an NLP approach to reduce the size of the dataset, which still leaves room for an LLM to improve the final matching.

An alternativee would be to use an LLM in combination with keyword filtering to limit the dataset size. This would provide higher accuracy at the cost of increased compute expense. I chose the NLP approach instead so that the logic behind matching & extracting data would be clearer for this exercise.

### Solution

The solution has 2 parts: [accessing the data](#accessing-the-data) and [processing it](#processing-the-data).

#### Accessing the data

I opted for node-fetch, which is a reliable no-frills library. No auth was required for the endpoints. I used debouncing with exponential backoff, with a max number of tries, and handled failure codes and empty responses separately. I typed the responses to make building on them easier.

### Processing the data

I opted for a simple matching and ranking algorithm leveraging `Fuse.js` and an NLP library called `compromise`. It follows these steps:

1. Parse the available jobs and their locations
2. Pass them to Fuse's fuzzy matching algorithm
3. Loop through each user
4. Pass the user's bio to `compromise`
5. Extract their desired locations and job titles [(this is sometimes a little dubious)](#caveats)
6. Check their desired locations & jobs against the fuzzy matchers
7. Generate a score for each of these
8. Rank the jobs based on that score

#### Caveats

As mentioned above, there are limitations to the `compromise` library. It didn't appear to be able to distinguish between the phrases _in London_ and _outside of London_, and for both would produce the same result. It's possible that with some extra massaging it could perform better, but if not this is a likely candidate for and LLM.

## Infrastructure & testing

I added Docker support, since I expect something like this would be run on cloud architecture and would need containerised. It's missing healthchecks to facilitate this but that's easily enough added.

I used Jest for testing, and included some unit tests. With more time I'd like to include some integration tests.

## Running the project

### Setup

Create a .env file at the root level. This is included in the .gitignore to avoid sharing sensitive data. Add in values for the following keys:

-  BRIGHT_NETWORK_URL

#### Using Docker and Docker Compose (recommended)

Use this command:

```
docker compose up
```

#### Running without docker

Use this command:

```
npm ci && npm run recommendations
```

###
