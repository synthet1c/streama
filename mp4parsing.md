
### Resources
- [onlinemp4parser.com](https://www.onlinemp4parser.com/)
- [Mozilla - streaming media on demand with media source extensions](https://hacks.mozilla.org/2015/07/streaming-media-on-demand-with-media-source-extensions/)
- [MP4 Info - get file codec string](http://nickdesaulniers.github.io/mp4info/)

### Segments

streamable MP4 files are binary files that consist of ftyp, moov and moof and mdata segments.

* *ftyp* - tells decoder how the file is encoded
* *moov* - declares the length of the file

MP4 segments consist of moof and mdat
* *moof* - Segment header that tells the decoder the size of the block it's start position and end position
    * *mfhd* - Movie Fragment header
    * *traf* - Track Fragment
        * *tfhd* - ?
        * *tfdt* - ?
        * *trun* - ?
* *mdat* - Media Data


- how to get codec for
- need to know how to parse moof
- how to get timestamp from moof

### codec
Supported by chrome for `this_one.mp4` file
`'video/mp4; codecs="avc1.42e01e, mp4a.40.2"'`
