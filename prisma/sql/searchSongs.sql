-- @param {String} $1:query
-- @param {Int} $2:limit
-- @param {Int} $3:offset


SELECT *, strict_word_similarity(name, $1) AS rank
FROM songs
ORDER BY rank DESC
LIMIT $2
OFFSET $3;