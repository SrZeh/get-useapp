const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// usar o transformer de SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// dizer ao Metro que .svg não é asset e sim source
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
