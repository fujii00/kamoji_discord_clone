import bcrypt from 'bcryptjs';
/**
 * @param {string} password
 * @return {Promise<string>}
 * */
export async function hashPassword(password)
{
    const salt = await bcrypt.genSalt(10);
    return  await bcrypt.hash(password, salt);
}

/**
 * @param {string} password
 * @param {string} hashedPassword
 * @return {Promise<boolean>}
 * */
export async function verifyPassword(password,hashedPassword) {
    let result = false
    try {
        const validPassword = await bcrypt.compare(password, hashedPassword);
        result = !!validPassword
    } catch (e) {
    }
    return result
}