//@ts-check

module.exports = (/**@type string */ regexStr) => {
    let prefix = '^/';
    if (process.env.KOKOROBOT_COMMAND_PREFIX && process.env.KOKOROBOT_COMMAND_PREFIX !== '') {
        prefix = process.env.KOKOROBOT_COMMAND_PREFIX;
    }

    const re = `${regexStr}/`.split('/');
    const regex = re[1];
    const option = re[2] !== '' ? re[2] : undefined;
    return new RegExp(prefix + regex.replace(/\\/g, '\\'), option);
}