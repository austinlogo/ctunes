
function getTrackId (prefix, elt, cb) {
	eltId = elt.id;
	var trackId = eltId.substring(prefix.length, elt.length);

	return cb (trackId);

}