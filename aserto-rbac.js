const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { is } = require("@aserto/aserto-node");

const authzOptions = {
  authorizerServiceUrl: process.env.ASERTO_AUTHORIZER_SERVICE_URL,
  instanceName: process.env.ASERTO_POLICY_INSTANCE_NAME,
  instanceLabel: process.env.ASERTO_POLICY_INSTANCE_LABEL,
  policyRoot: process.env.ASERTO_POLICY_ROOT,
  authorizerApiKey: process.env.ASERTO_AUTHORIZER_API_KEY,
  tenantId: process.env.ASERTO_TENANT_ID,
};

module.exports = function (options) {
  if (options === undefined || options === null) options = authzOptions;
  return {
    checkJwt: checkJwt,
    checkIsInGroup: checkIsInGroup(options),
  };
};

const checkIsInGroup = (options) => {
  return async function (req, res, next) {
    try {
      const allowed = await is("allowed", req, options, "rbac.is_in_group",
        {
          group: req.query.group,
        },
      );
      req.allowed = allowed;
      console.log(`group: ${req.query.group}`);
      console.log(`allowed: ${allowed}`);
      
      if (!allowed) {
        res.status(403).send("Unauthorized");
        return;
      }
      next();
    } catch (e) {
      res.status(500).send(e.message);
    }
  };
};

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKS_URI,
  }),

  // Validate the audience and the issuer
  audience: process.env.AUDIENCE,
  issuer: process.env.ISSUER,
  algorithms: ["RS256"],
});
