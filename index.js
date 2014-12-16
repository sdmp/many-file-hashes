var Promise = require('promise')
var path = require('path')
var crypto = require('crypto')
var fs = require('fs')

module.exports = function(options, cb) {
	if (Array.isArray(options)) {
		options = {
			files: options
		}
	}
	options = options || {}
	options.files = options.files || []
	options.hash = options.hash || 'sha1'
	options.encoding = options.encoding || 'hex'

	Promise.all(options.files.map(function createFileObject(file) {
		return {
			original: file,
			fullPath: path.resolve(file)
		}
	}).map(function createFileHashPromise(file) {
		return new Promise(function(resolve, reject) {
			var fd = fs.createReadStream(file.fullPath)
			var hash = crypto.createHash(options.hash)
			hash.setEncoding(options.encoding)

			fd.on('end', function() {
				hash.end()
				file.hash = hash.read()
				resolve(file)
			})

			fd.pipe(hash)
		})
	})).then(function(resolve) {
		cb(resolve)
	})

}
