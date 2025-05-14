import os, json, hashlib
import pytest
from analyze_sentiment_stdin import analyze_response, compute_bias_index

@ pytest.fixture(autouse=True)
def clear_cache(tmp_path, monkeypatch):
    # Redirect cache to a tmp file
    cache_file = tmp_path / 'cache.json'
    monkeypatch.setenv('SENTIMENT_CACHE_PATH', str(cache_file))
    yield


def test_analyze_response_caching():
    text = 'I love this.'
    first = analyze_response(text)
    second = analyze_response(text)
    assert first == second
    assert 'label' in first and 'polarity' in first


def test_compute_bias_index():
    items = [{'sentiment': 'positive'}]*2 + [{'sentiment': 'negative'}]
    summary = compute_bias_index(items)
    assert summary['bias_index']['positive'] == pytest.approx(66.67)
    assert summary['dominant_sentiment'] == 'positive'