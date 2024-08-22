const asyncErrorWrapper = require("express-async-handler");
const natural = require("natural");
const pos = require("pos");
const tfidf = new natural.TfIdf();
const wordnet = new natural.WordNet();

const wordCount = asyncErrorWrapper(async (req, res) => {
  try {
    const text = req.body.text || "";

    if (!text) {
      return res.status(400).json({ message: "Missing paramaters text." });
    }

    const wordCount = text.split(/\s+/).length;
    return res.status(200).json({ success: true, wordCount });
  } catch (error) {
    console.log("Error processing word count " + error);
    return res.status(500).json({
      success: false,
      error: "Error processing word count",
    });
  }
});

const stem = asyncErrorWrapper(async (req, res) => {
  try {
    const text = (req.body.text || "").toLowerCase();

    if (!text) {
      return res
        .status(400)
        .json({ succes: false, error: 'Missing required parameter "text"' });
    }

    const tokens = text.split(/[\s,]+/);

    const getLemma = (word) => {
      return new Promise((resolve) => {
        wordnet.lookup(word, (results) => {
          if (results && results.length > 0) {
            resolve(results[0].lemma);
          } else {
            resolve(word);
          }
        });
      });
    };

    const stems = await Promise.all(tokens.map((token) => getLemma(token)));
    return res.status(200).json({ success: true, stems });
  } catch (error) {
    console.log("Error processing stemming " + error);
    return res.status(500).json({
      success: false,
      error: "Error processing stemming",
    });
  }
});

const posRoute = asyncErrorWrapper(async (req, res) => {
  try {
    const text = req.body.text || "";

    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing required parameter "text"' });
    }

    const words = new pos.Lexer().lex(text);
    const tagger = new pos.Tagger();
    const taggedWords = tagger.tag(words);
    return res.status(200).json({ success: true, taggedWords });
  } catch (error) {
    console.log("Error processing Part of Speech. " + error);
    return res.status(500).json({
      success: false,
      error: "Error processing Part of Speech.",
    });
  }
});

const keywords = asyncErrorWrapper(async (req, res) => {
  try {
    const text = req.body.text || "";

    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing required parameter "text"' });
    }

    tfidf.addDocument(text);

    const docIndex = tfidf.documents.length - 1;
    const keywords = tfidf
      .listTerms(docIndex)
      .map((item) => ({ term: item.term, tfidf: item.tfidf }));

    return res.status(200).json({ success: true, keywords });
  } catch (error) {
    console.log("Error processing keywords. " + error);
    return res.status(500).json({
      success: false,
      error: "Error processing keywords",
    });
  }
});

const tokenize = asyncErrorWrapper(async (req, res) => {
  try {
    const tokenizer = new natural.WordTokenizer();
    const text = req.body.text || "";
    if (!text) {
      console.log('Missing required parameter "text"');
      return res
        .status(400)
        .json({ success: false, error: 'Missing required parameter "text"' });
    }
    const tokens = tokenizer.tokenize(text);
    return res.status(200).json({ success: true, tokens });
  } catch (error) {
    console.log("Error processing tokenize. " + error);
    return res
      .status(500)
      .json({ success: false, error: "Error processing tokenize." });
  }
});

const sentiment = asyncErrorWrapper(async (req, res) => {
  try {
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer("English", stemmer, "afinn");

    const text = req.body.text || "";
    if (!text) {
      console.log('Missing required parameter "text"');
      return res
        .status(400)
        .json({ success: false, error: 'Missing required parameter "text"' });
    }
    const sentiment = analyzer.getSentiment(text.split(" "));
    return res.status(200).json({ success: true, sentiment });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const ner = asyncErrorWrapper(async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) {
      console.log('Missing required parameter "text"');
      return res
        .status(400)
        .json({ success: false, error: 'Missing required parameter "text"' });
    }

    const words = new pos.Lexer().lex(text);
    const tagger = new pos.Tagger();
    const taggedWords = tagger.tag(words);

    const entities = taggedWords
      .filter((word) => {
        const posTag = word[1];
        return (
          posTag === "NNP" ||
          posTag === "NNPS" ||
          posTag === "NN" ||
          posTag === "NNS"
        );
      })
      .map((word) => word[0]);

    const uniqueEntities = [...new Set(entities)];

    return res.status(200).json({ success: true, entities: uniqueEntities });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  wordCount,
  tokenize,
  stem,
  posRoute,
  keywords,
  sentiment,
  ner,
};
